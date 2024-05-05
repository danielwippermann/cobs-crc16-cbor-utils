const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cobsDecoderModule = require('../src/cobs-decoder');

const testData = require('./cobs-test-data');

describe('cobs-decoder module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cobsDecoderModule, [
            'CobsDecoder',
        ]);
    });

    const {
        CobsDecoder,
    } = cobsDecoderModule;

    describe('CobsDecoder', () => {

        it('should be a class', () => {
            expectToBeClass(CobsDecoder, [
                'constructor',
                'reset',
                'decode',
            ]);
        });

        it('constructor() should work correctly', () => {
            const dec1 = new CobsDecoder();

            expectObjectOwnPropertyNamesToEqual(dec1, [
                'blockBuffer',
                'blockStart',
                'blockIndex',
                'blockLength',
                'totalLength',
                'buffer',
                'bufferIndex',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);

            expect(dec1.blockBuffer).toHaveLength(256);
            expect(dec1.blockStart).toBe(0xFF);
            expect(dec1.blockIndex).toBe(0xFF);
            expect(dec1.blockLength).toBe(0xFF);
            expect(dec1.totalLength).toBe(0);
            expect(dec1.buffer).toHaveLength(512);
            expect(dec1.bufferIndex).toBe(0);

            const dec2 = new CobsDecoder({
                maxBuffer: 128,
            });

            expect(dec2.blockBuffer).toHaveLength(256);
            expect(dec2.blockStart).toBe(0xFF);
            expect(dec2.blockIndex).toBe(0xFF);
            expect(dec2.blockLength).toBe(0xFF);
            expect(dec2.totalLength).toBe(0);
            expect(dec2.buffer).toHaveLength(128);
            expect(dec2.bufferIndex).toBe(0);
        });

        it('reset() should work correctly', () => {
            const dec1 = new CobsDecoder();
            dec1.blockStart = 123;
            dec1.blockIndex = 123;
            dec1.blockLength = 123;
            dec1.totalLength = 123;
            dec1.bufferIndex = 123;

            dec1.reset();

            expect(dec1.blockStart).toBe(0xFF);
            expect(dec1.blockIndex).toBe(0xFF);
            expect(dec1.blockLength).toBe(0xFF);
            expect(dec1.totalLength).toBe(0);
            expect(dec1.bufferIndex).toBe(0);
        });

        it('decode() should work correctly', () => {
            function expectDecodeEventsEqual(encodedBytes, expectedEvents, options) {
                const maxBuffer = options?.maxBuffer ?? 512;

                const dec1 = new CobsDecoder({
                    maxBuffer,
                });

                const actualEvents = [];
                dec1.on('packetError', err => {
                    actualEvents.push([ '@packetError', err ]);
                });
                dec1.on('packetBlock', block => {
                    actualEvents.push([ '@packetBlock', block.length ]);
                });
                dec1.on('packetEnd', length => {
                    actualEvents.push([ '@packetEnd', length ]);
                });
                dec1.on('packet', buffer => {
                    actualEvents.push([ '@packet', buffer.toString('hex') ]);
                });

                dec1.decode(Buffer.from(encodedBytes, 'hex'));

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectDecodeEventsEqual('00', [
                [ '@packetEnd', 0 ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData1Enc, [
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 1 ],
                [ '@packet', testData.cobsTestData1Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData2Enc, [
                [ '@packetBlock', 1 ],
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 2 ],
                [ '@packet', testData.cobsTestData2Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData3Enc, [
                [ '@packetBlock', 1 ],
                [ '@packetBlock', 2 ],
                [ '@packetEnd', 3 ],
                [ '@packet', testData.cobsTestData3Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData4Enc, [
                [ '@packetBlock', 3 ],
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 4 ],
                [ '@packet', testData.cobsTestData4Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData5Enc, [
                [ '@packetBlock', 4 ],
                [ '@packetEnd', 4 ],
                [ '@packet', testData.cobsTestData5Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData6Enc, [
                [ '@packetBlock', 2 ],
                [ '@packetBlock', 1 ],
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 4 ],
                [ '@packet', testData.cobsTestData6Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData7Enc, [
                [ '@packetBlock', 254 ],
                [ '@packetEnd', 254 ],
                [ '@packet', testData.cobsTestData7Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData8Enc, [
                [ '@packetBlock', 1 ],
                [ '@packetBlock', 254 ],
                [ '@packetEnd', 255 ],
                [ '@packet', testData.cobsTestData8Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData9Enc, [
                [ '@packetBlock', 254 ],
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 255 ],
                [ '@packet', testData.cobsTestData9Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData10Enc, [
                [ '@packetBlock', 254 ],
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 255 ],
                [ '@packet', testData.cobsTestData10Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData11Enc, [
                [ '@packetBlock', 254 ],
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 255 ],
                [ '@packet', testData.cobsTestData11Raw.toString('hex') ],
            ]);

            expectDecodeEventsEqual('031100', [
                [ '@packetError', { kind: 'UnexpectedZero' } ],
            ]);

            expectDecodeEventsEqual(testData.cobsTestData11Enc, [
                [ '@packetBlock', 254 ],
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 255 ],
            ], {
                maxBuffer: 0,
            });

            expectDecodeEventsEqual(testData.cobsTestData11Enc, [
                [ '@packetBlock', 254 ],
                [ '@packetBlock', 1 ],
                [ '@packetEnd', 255 ],
                [ '@packetError', { kind: 'Overflow', totalLength: 255 } ],
            ], {
                maxBuffer: 1,
            });
        });

    });

});
