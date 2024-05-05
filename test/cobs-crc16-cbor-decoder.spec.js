const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cobsCrc16CborDecoderModule = require('../src/cobs-crc16-cbor-decoder');

describe('cobs-crc16-cbor-decoder module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cobsCrc16CborDecoderModule, [
            'CobsCrc16CborDecoder',
        ]);
    });

    const {
        CobsCrc16CborDecoder,
    } = cobsCrc16CborDecoderModule;

    describe('CobsCrc16CborDecoder', () => {

        it('should be a class', () => {
            expectToBeClass(CobsCrc16CborDecoder, [
                'constructor',
                'reset',
                'decode',
            ]);
        });

        it('constructor() should work correctly', () => {
            const dec1 = new CobsCrc16CborDecoder();

            expectObjectOwnPropertyNamesToEqual(dec1, [
                'cobsCrc16Decoder',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);

            expect(dec1.cobsCrc16Decoder.cobsDecoder.buffer).toHaveLength(512);

            const dec2 = new CobsCrc16CborDecoder({ maxBuffer: 1024 });

            expectObjectOwnPropertyNamesToEqual(dec2, [
                'cobsCrc16Decoder',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);

            expect(dec2.cobsCrc16Decoder.cobsDecoder.buffer).toHaveLength(1024);
        });

        it('reset() should work correctly', () => {
            const dec1 = new CobsCrc16CborDecoder();

            dec1.reset();
        });

        it('decode() should work correctly', () => {
            function expectDecodeToEqualEvents(input, expectedEvents) {
                const dec1 = new CobsCrc16CborDecoder();

                const actualEvents = [];

                dec1.on('packet', packet => {
                    actualEvents.push([ '@packet', packet ]);
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
                [ '@packet', [ 0, 16, [ 0 ] ] ],
            ]);

            expectDecodeToEqualEvents('000283031081036fff00', [
                [ '@packetError', { kind: 'CrcMismatch' } ],
            ]);
        });

    });

});
