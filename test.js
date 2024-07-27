const assert = require('assert');
const { decimalToLEB128, LEB128ToDecimal, formatLEB128, parseLEB128Input } = require('./script.js');

function runTests() {
    console.log('Running LEB128 Converter Tests...');

    // Test decimalToLEB128
    assert.deepStrictEqual(decimalToLEB128(0), [0], 'decimalToLEB128(0) failed');
    assert.deepStrictEqual(decimalToLEB128(127), [127], 'decimalToLEB128(127) failed');
    assert.deepStrictEqual(decimalToLEB128(128), [128, 1], 'decimalToLEB128(128) failed');
    assert.deepStrictEqual(decimalToLEB128(255), [255, 1], 'decimalToLEB128(255) failed');
    assert.deepStrictEqual(decimalToLEB128(16384), [128, 128, 1], 'decimalToLEB128(16384) failed');
    assert.deepStrictEqual(decimalToLEB128(2097151), [255, 255, 127], 'decimalToLEB128(2097151) failed');

    // Test LEB128ToDecimal
    assert.strictEqual(LEB128ToDecimal([0]), 0, 'LEB128ToDecimal([0]) failed');
    assert.strictEqual(LEB128ToDecimal([127]), 127, 'LEB128ToDecimal([127]) failed');
    assert.strictEqual(LEB128ToDecimal([128, 1]), 128, 'LEB128ToDecimal([128, 1]) failed');
    assert.strictEqual(LEB128ToDecimal([255, 1]), 255, 'LEB128ToDecimal([255, 1]) failed');
    assert.strictEqual(LEB128ToDecimal([128, 128, 1]), 16384, 'LEB128ToDecimal([128, 128, 1]) failed');
    assert.strictEqual(LEB128ToDecimal([255, 255, 127]), 2097151, 'LEB128ToDecimal([255, 255, 127]) failed');

    // Test invalid LEB128 input
    assert.throws(() => LEB128ToDecimal([128]), Error, 'LEB128ToDecimal([128]) should throw an error');
    assert.throws(() => LEB128ToDecimal([255, 255]), Error, 'LEB128ToDecimal([255, 255]) should throw an error');

    // Test formatLEB128
    assert.strictEqual(formatLEB128([128, 1], 'hex-space'), '80 01', 'formatLEB128([128, 1], "hex-space") failed');
    assert.strictEqual(formatLEB128([128, 1], 'dec-comma'), '128,1', 'formatLEB128([128, 1], "dec-comma") failed');
    assert.strictEqual(formatLEB128([128, 1], 'hex-0x-comma'), '0x80,0x01', 'formatLEB128([128, 1], "hex-0x-comma") failed');
    assert.strictEqual(formatLEB128([128, 1], 'hex-string'), '8001', 'formatLEB128([128, 1], "hex-string") failed');

    // Test parseLEB128Input
    assert.deepStrictEqual(parseLEB128Input('80 01'), [128, 1], 'parseLEB128Input("80 01") failed');
    assert.deepStrictEqual(parseLEB128Input('128,1'), [128, 1], 'parseLEB128Input("128,1") failed');
    assert.deepStrictEqual(parseLEB128Input('0x80,0x01'), [128, 1], 'parseLEB128Input("0x80,0x01") failed');
    assert.deepStrictEqual(parseLEB128Input('8001'), [128, 1], 'parseLEB128Input("8001") failed');

    console.log('All tests passed successfully!');
}

runTests();
