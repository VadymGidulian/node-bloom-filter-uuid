'use strict';

const omit         = require('lodash.omit');
const {v4: uuidv4} = require('uuid');

const BloomFilter = require('../../src');

const variant    = $VARIANT$;
const k          = $K$;
const bufferSize = $BUFFER_SIZE$;
describe('Bloom filter (variant $VARIANT$)', () => {
	test('Variant description', () => {
		const variantDescription = BloomFilter.describeVariant(variant);
		expect(omit(variantDescription, ['calcE', 'calcN'])).toStrictEqual({k, m: bufferSize * 8, bufferSize});
		expect(typeof variantDescription.calcE).toBe('function');
		expect(typeof variantDescription.calcN).toBe('function');
	});
	
	test('Buffer size', () => {
		const bf = new BloomFilter(variant);
		
		expect(bf.buffers.reduce((sum, buffer) => sum + buffer.length, 0)).toStrictEqual(bufferSize);
	});
	
	{
		function getTestParams() {
			if      (variant <= 20) return [100, 0.01,       100_000];
			else if (variant <= 25) return [10,  0.001,    1_000_000];
			else if (variant <= 30) return [1,   0.0001,  10_000_000];
			else                    return [1,   0.00001, 10_000_000];
		}
		
		const [TRIES, e, N] = getTestParams();
		const {calcN}       = BloomFilter.describeVariant(variant);
		
		test(`False positive probability (${e*100}%) of a set with ${prettyNumber(calcN(e))} elements, ${TRIES} times`, () => {
			let falsePositives = 0;
			for (let i = 0; i < TRIES; i++) {
				const bf = new BloomFilter(variant);
				
				for (let j = 0; j < calcN(e); j++) {
					const uuid = uuidv4();
					bf.add(uuid);
					if (!bf.has(uuid)) throw new Error('False negative');
				}
				
				for (let j = 0; j < N; j++) {
					if (bf.has(uuidv4())) falsePositives++;
				}
			}
			
			const actualE = falsePositives / (TRIES * N);
			console.info(`Actual error: ${Number((actualE * 100).toFixed(6))}%`);
			if (variant === 2) {
				// Too inaccurate
				expect(actualE).toBeLessThan(0.075);
			} else if (variant === 3) {
				// Slightly inaccurate
				expect(actualE).toBeLessThan(0.025);
			} else {
				expect(actualE).toBeCloseTo(e, -Math.log10(e));
			}
		});
	}
});



function prettyNumber(value) {
	const n = Number(value.toPrecision(3));
	
	let divider = 1;
	let suffix  = '';
	for (const [d, s] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) {
		if (n < d) continue;
		divider = d;
		suffix  = s;
		break;
	}
	
	const [ip, fp] = String(n / divider).split('.');
	return ip + (fp ? `.${fp}` : '') + suffix;
}
