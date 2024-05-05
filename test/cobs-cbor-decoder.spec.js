const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cobsCborDecoderModule = require('../src/cobs-cbor-decoder');

describe('cobs-cbor-decoder module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cobsCborDecoderModule, [
            'CobsCborDecoder',
        ]);
    });

    const {
        CobsCborDecoder,
    } = cobsCborDecoderModule;

    describe('CobsCborDecoder', () => {

        it('should be a class', () => {
            expectToBeClass(CobsCborDecoder, [
                'constructor',
                'reset',
                'decode',
            ]);
        });

        it('constructor() should work correctly', () => {
            const dec1 = new CobsCborDecoder();

            expectObjectOwnPropertyNamesToEqual(dec1, [
                'cobsDecoder',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);

            expect(dec1.cobsDecoder.buffer).toHaveLength(512);

            const dec2 = new CobsCborDecoder({ maxBuffer: 1024 });

            expectObjectOwnPropertyNamesToEqual(dec2, [
                'cobsDecoder',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);

            expect(dec2.cobsDecoder.buffer).toHaveLength(1024);
        });

        it('reset() should work correctly', () => {
            const dec1 = new CobsCborDecoder();

            dec1.reset();
        });

        it('decode() should work correctly', () => {
            function expectDecodeToEqualEvents(input, expectedEvents, options) {
                const dec1 = new CobsCborDecoder(options);

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

            expectDecodeToEqualEvents('00', [
            ]);

            expectDecodeToEqualEvents('010100', [
                [ '@packet', 0 ],
            ]);

            expectDecodeToEqualEvents('061a1122334400', [
                [ '@packet', 0x11223344 ],
            ]);

            expectDecodeToEqualEvents('061a1122334400', [
                [ '@packetError', { kind: 'Overflow', totalLength: 5 } ],
            ], {
                maxBuffer: 1,
            });
        });

    });

});
