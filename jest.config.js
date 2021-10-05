'use strict';

const os = require('os');

module.exports = {
	collectCoverage:     true,
	collectCoverageFrom: ['<rootDir>/src/**/*.js'],
	maxConcurrency:      Math.floor(os.cpus().length * 0.75),
	testEnvironment:     'node',
	testMatch:           ['<rootDir>/test/**/*.test.js'],
	verbose:             true
};
