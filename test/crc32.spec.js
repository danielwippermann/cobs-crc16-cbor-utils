const crypto = require('crypto');

const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const crc32Module = require('../src/crc32');

describe('crc32 module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(crc32Module, [
            'Crc32',
        ]);
    });

    const {
        Crc32,
    } = crc32Module;

    describe('Crc32', () => {

        it('should be a class', () => {
            expectToBeClass(Crc32, [
                'constructor',
                'reset',
                'update',
                'finish',
                'verify',
            ]);
        });

        it('constructor() should work correctly', () => {
            const crc = new Crc32();

            expectObjectOwnPropertyNamesToEqual(crc, [
                'crc',
            ]);

            expect(crc.crc).toEqual(0xFFFFFFFF);
        });

        it('reset() should work correctly', () => {
            const crc = new Crc32();
            crc.crc = 0x00000000;

            crc.reset();

            expect(crc.crc).toBe(0xFFFFFFFF);
        });

        it('update() should work correctly', () => {
            const crc = new Crc32();

            crc.update(testData1);

            expect(crc.crc).toBe((0x77F29DD1 ^ 0xFFFFFFFF) + 0x100000000);
        });

        it('finish() should work correctly', () => {
            const crc = new Crc32();
            crc.update(testData1);

            const result1 = crc.finish();

            expect(result1).toBe(0x77F29DD1);

            const result2 = crc.finish('number');

            expect(result2).toBe(0x77F29DD1);

            const result3 = crc.finish('array');

            expect(result3).toEqual(expect.any(Array));
            expect(result3).toHaveLength(4);
            expect(result3 [0]).toBe(0xD1);
            expect(result3 [1]).toBe(0x9D);
            expect(result3 [2]).toBe(0xF2);
            expect(result3 [3]).toBe(0x77);

            expect(() => {
                crc.finish('unknown');
            }).toThrow('Unexpected type');
        });

        it('verify() should work correctly', () => {
            const crc = new Crc32();
            crc.update(testData2);

            expect(crc.verify()).toBe(true);

            const buffer = crypto.randomBytes(20);

            crc.reset();
            crc.update(buffer.subarray(0, 16));

            const crcBytes = crc.finish('array');
            buffer [16] = crcBytes [0];
            buffer [17] = crcBytes [1];
            buffer [18] = crcBytes [2];
            buffer [19] = crcBytes [3];

            crc.reset();
            crc.update(buffer);

            if (!crc.verify()) {
                console.log({ buffer });
            }

            expect(crc.verify()).toBe(true);
        });

        const testData1 = Buffer.from('11223344', 'hex');

        const testData2 = Buffer.from('11223344D19DF277', 'hex');

    });

});
