'use strict';

const childProcess = require('child_process');
const fs           = require('fs');
const path         = require('path')

const B   = 1;
const KiB = 2**10;
const MiB = 2**20;
const GiB = 2**30;

const DATA = [
	[35,  3,  12 * GiB],
	[34,  3,   6 * GiB],
	[33,  3,   3 * GiB],
	[32,  4,   2 * GiB],
	[31,  4,   1 * GiB],
	[30,  4, 512 * MiB],
	[29,  4, 256 * MiB],
	[28,  4, 128 * MiB],
	[27,  4,  64 * MiB],
	[26,  4,  32 * MiB],
	[25,  5,  20 * MiB],
	[24,  5,  10 * MiB],
	[23,  5,   5 * MiB],
	[22,  5,   2.5 * MiB],
	[21,  6,   1.5 * MiB],
	[20,  6, 768 * KiB],
	[19,  6, 384 * KiB],
	[18,  7, 224 * KiB],
	[17,  7, 112 * KiB],
	[16,  8,  64 * KiB],
	[15,  8,  32 * KiB],
	[14,  9,  18 * KiB],
	[13,  9,   9 * KiB],
	[12, 10,   5 * KiB],
	[11, 11,   2.75 * KiB],
	[10, 12,   1.5 * KiB],
	[ 9, 14, 896 * B],
	[ 8, 16, 512 * B],
	[ 7, 18, 288 * B],
	[ 6, 21, 168 * B],
	[ 5, 25, 100 * B],
	[ 4, 32,  64 * B],
	[ 3, 42,  42 * B],
	[ 2, 64,  32 * B]
];

console.info('Removing previous generated tests, if any...');
const generatedTestsDirPath = path.join(__dirname, 'generated');
fs.rmSync(generatedTestsDirPath, {force: true, recursive: true});
console.info('Removed.');


console.info('Generating tests...');
fs.mkdirSync(generatedTestsDirPath);

const template = fs.readFileSync(path.join(__dirname, '_template.js'), 'utf8');

for (const [variant, k, bufferSize] of DATA) {
	const fileContent = template
		.replace(/\$VARIANT\$/g,     variant)
		.replace(/\$K\$/g,           k)
		.replace(/\$BUFFER_SIZE\$/g, bufferSize);
	const filePath = path.join(generatedTestsDirPath, `variant-${variant}.test.js`);
	
	fs.writeFileSync(filePath, fileContent, 'utf8');
}
console.log('Generated.');


console.info('Executing...');
childProcess.spawnSync('npx', ['jest'], {stdio: 'inherit'});
console.info('Done.');
