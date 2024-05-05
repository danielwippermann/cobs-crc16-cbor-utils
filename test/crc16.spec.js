const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const crc16Module = require('../src/crc16');

describe('crc16 module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(crc16Module, [
            'Crc16',
        ]);
    });

    const {
        Crc16,
    } = crc16Module;

    describe('Crc16', () => {

        it('should be a class', () => {
            expectToBeClass(Crc16, [
                'constructor',
                'reset',
                'update',
                'finish',
                'verify',
            ]);
        });

        it('constructor() should work correctly', () => {
            const crc = new Crc16();

            expectObjectOwnPropertyNamesToEqual(crc, [
                'crc',
            ]);

            expect(crc.crc).toEqual(0xFFFF);
        });

        it('reset() should work correctly', () => {
            const crc = new Crc16();
            crc.crc = 0x0000;

            crc.reset();

            expect(crc.crc).toBe(0xFFFF);
        });

        it('update() should work correctly', () => {
            const crc = new Crc16();

            crc.update(testData1);

            expect(crc.crc).toBe(0x0DAD ^ 0xFFFF);
        });

        it('finish() should work correctly', () => {
            const crc = new Crc16();
            crc.update(testData1);

            const result1 = crc.finish();

            expect(result1).toBe(0x0DAD);

            const result2 = crc.finish('number');

            expect(result2).toBe(0x0DAD);

            const result3 = crc.finish('array');

            expect(result3).toEqual(expect.any(Array));
            expect(result3).toHaveLength(2);
            expect(result3 [0]).toBe(0xAD);
            expect(result3 [1]).toBe(0x0D);

            expect(() => {
                crc.finish('unknown');
            }).toThrow('Unexpected type');
        });

        it('verify() should work correctly', () => {
            const crc = new Crc16();
            crc.update(testData2);

            expect(crc.verify()).toBe(true);
        });

        const testData1 = Buffer.from('11223344', 'hex');

        const testData2 = Buffer.from('11223344AD0D', 'hex');

    });

});
