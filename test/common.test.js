'use strict';

const BloomFilter = require('../src');

test.each([1, 0, -1, NaN, null, undefined])('Invalid variant description (%s)', (variant) => {
	expect(() => BloomFilter.describeVariant(variant)).toThrow(TypeError);
});
