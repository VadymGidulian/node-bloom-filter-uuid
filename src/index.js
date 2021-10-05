'use strict';

const {constants: {MAX_LENGTH: MAX_BUFFER_SIZE}} = require('buffer');
const {parse: uuidParse}                         = require('uuid');

class BloomFilter {
	
	buffers;
	variant;
	
	static describeVariant(variant) {
		if (!variant || (variant < 2)) throw new TypeError('Variant should be >= 2');
		
		const k = Math.floor(128 / variant);
		const m = k * (2**variant);
		
		const calcE = n => (1 - Math.exp(-k * n / m))**k;
		const calcN = e => Math.round(-m * Math.log(1 - e**(1/k)) / k);
		
		return {k, m, bufferSize: m / 8, calcE, calcN};
	}
	
	static printHelp() {
		const errors = [0.001, 0.01, 0.1, 1, 3, 5, 10, 15, 20, 25, 50];
		
		const help = [
			'A Bloom filter is a space-efficient probabilistic data structure, that is used to test whether an element is a member of a set.',
			'False positive matches are possible, but false negatives are not – in other words, a query returns either "possibly in set" or "definitely not in set".',
			'Elements can be added to the set, but not removed; the more items added, the larger the probability of false positives.\n'
		];
		
		const joiner     = ' | ';
		const columns    = ['Variant', centerText('Memory', 10), ...errors.map(n => centerText(n + '%', 8))];
		const tableTitle = columns.join(joiner)
		help.push(centerText('Max. number of inserted elements for desired false positive probability', tableTitle.length));
		help.push(tableTitle);
		help.push(columns.map(s => ''.padStart(s.length, '-')).join('-+-'));
		
		for (let i = 40; i > 1; i--) {
			const {bufferSize, calcN} = BloomFilter.describeVariant(i);
			help.push([
				centerText(String(i).padStart(2, ' '), columns[0].length),
				prettySize(bufferSize),
				...errors.map(e => prettyNumber(calcN(e / 100)))
			].join(joiner));
		}
		
		console.log(help.join('\n') + '\n');
		
		
		
		function centerText(text, columnWidth) {
			text = String(text);
			const paddingLeft = Math.ceil((columnWidth - text.length) / 2);
			return text.padStart(text.length + paddingLeft, ' ').padEnd(columnWidth, ' ');
		}
		
		function prettyNumber(value) {
			const n = Number(value.toPrecision(3));
			
			let divider = 1;
			let suffix  = ' ';
			for (const [d, s] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) {
				if (n < d) continue;
				divider = d;
				suffix  = s;
				break;
			}
			
			const [ip, fp] = String(n / divider).split('.');
			return ip.padStart(3, ' ') + (fp ? `.${fp}` : '').padEnd(4, ' ') + suffix;
		}
		
		function prettySize(value) {
			let divider = 1;
			let suffix  = 'B';
			for (const [d, s] of [[2**40, 'TiB'], [2**30, 'GiB'], [2**20, 'MiB'], [2**10, 'KiB']]) {
				if (value < d) continue;
				divider = d;
				suffix  = s;
				break;
			}
			
			const [ip, fp] = String(value / divider).split('.');
			return ip.padStart(3, ' ') + (fp ? `.${fp}` : '').padEnd(4, ' ') + suffix.padStart(3, ' ');
		}
	}
	
	constructor(variant) {
		this.variant = variant;
		
		const {bufferSize} = BloomFilter.describeVariant(variant);
		const buffersSizes = [];
		{
			let leftSize = bufferSize;
			while (leftSize) {
				const length = Math.min(leftSize, MAX_BUFFER_SIZE);
				buffersSizes.push(length);
				leftSize -= length;
			}
		}
		this.buffers = buffersSizes.map(size => Buffer.alloc(size));
	}
	
	add(uuid) {
		const indexes = this._getIndexes(uuid);
		
		for (const index of indexes) {
			const bufferIndex = Math.floor(Math.floor(index / 8) / MAX_BUFFER_SIZE);
			const byteIndex   = Math.floor(index / 8) % MAX_BUFFER_SIZE;
			const bitIndex    = index % 8;
			
			this.buffers[bufferIndex][byteIndex] |= 2**bitIndex;
		}
	}
	
	has(uuid) {
		const indexes = this._getIndexes(uuid);
		
		for (const index of indexes) {
			const bufferIndex = Math.floor(Math.floor(index / 8) / MAX_BUFFER_SIZE);
			const byteIndex   = Math.floor(index / 8) % MAX_BUFFER_SIZE;
			const bitIndex    = index % 8;
			
			if (!(this.buffers[bufferIndex][byteIndex] & (2**bitIndex))) return false;
		}
		
		return true;
	}
	
	_getIndexes(uuid) {
		const uuidBuffer = Buffer.from(uuidParse(uuid));
		
		// Replace UUID version and variant
		uuidBuffer[6] = (uuidBuffer[6] & 0xf)
				+ ((uuidBuffer[0] & 1) << 4)
				+ ((uuidBuffer[1] & 1) << 5)
				+ ((uuidBuffer[2] & 1) << 6)
				+ ((uuidBuffer[3] & 1) << 7);
		uuidBuffer[8] = (uuidBuffer[8] & 0o77)
				+ ((uuidBuffer[4] & 1) << 6)
				+ ((uuidBuffer[5] & 1) << 7);
		
		const k = Math.floor(128 / this.variant);
		
		const groups     = [];
		let   byteN      = 0;
		let   leftInByte = 8;
		for (let i = 0; i < k; i++) {
			const group       = [];
			let   leftInGroup = this.variant;
			while (leftInGroup) {
				if (!leftInByte) {
					byteN++;
					leftInByte = 8;
				}
				
				const maskSize  = Math.min(leftInGroup, leftInByte);
				const maskShift = leftInByte  - maskSize;
				const bitsShift = leftInGroup - maskSize;
				group.push([byteN, maskSize, maskShift, bitsShift]);
				
				leftInGroup -= maskSize;
				leftInByte  -= maskSize;
			}
			groups.push(group);
		}
		
		const arr = [];
		for (const group of groups) {
			let n = 0;
			for (const [byteN, maskSize, maskShift, bitsShift] of group) {
				n += ((uuidBuffer[byteN] & (((2**maskSize) - 1) << maskShift)) >> maskShift) * (2**bitsShift);
			}
			arr.push(n);
		}
		
		return arr.map((n, i) => n + i * (2**this.variant));
	}
	
}

module.exports = BloomFilter;
