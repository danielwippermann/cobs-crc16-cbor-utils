const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cobsCrc16DecoderModule = require('../src/cobs-crc16-decoder');

describe('cobs-crc16-decoder module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cobsCrc16DecoderModule, [
            'CobsCrc16Decoder',
        ]);
    });

    const {
        CobsCrc16Decoder,
    } = cobsCrc16DecoderModule;

    describe('CobsCrc16Decoder', () => {

        it('should be a class', () => {
            expectToBeClass(CobsCrc16Decoder, [
                'constructor',
                'reset',
                'decode',
            ]);
        });

        it('constructor() should work correctly', () => {
            const dec1 = new CobsCrc16Decoder();

            expectObjectOwnPropertyNamesToEqual(dec1, [
                'cobsDecoder',
                'crc16',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);
        });

        it('reset() should work correctly', () => {
            const dec1 = new CobsCrc16Decoder();

            dec1.reset();
        });

        it('decode() should work correctly', () => {
            function expectDecodeToEqualEvents(input, expectedEvents, options) {
                const dec1 = new CobsCrc16Decoder(options);

                const actualEvents = [];

                dec1.on('packet', packet => {
                    actualEvents.push([ '@packet', packet.toString('hex') ]);
                });

                dec1.on('packetError', err => {
                    actualEvents.push([ '@packetError', err ]);
                });

                const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'hex');

                dec1.decode(buffer);

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectDecodeToEqualEvents('000000', [
            ]);

            expectDecodeToEqualEvents('000283031081036f4800', [
                [ '@packet', '8300108100' ],
            ]);

            expectDecodeToEqualEvents('000283031081036fff00', [
                [ '@packetError', { kind: 'CrcMismatch' } ],
            ]);

            expectDecodeToEqualEvents('000283031081036f4800', [
                [ '@packetError', { kind: 'Overflow', totalLength: 7 } ],
            ], {
                maxBuffer: 1,
            });

            expectDecodeToEqualEvents('00020100', [
                [ '@packetError', { kind: 'TooSmallForCrc16', totalLength: 1 } ],
            ]);
        });

    });

});
