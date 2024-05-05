const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cobsCborEncoderModule = require('../src/cobs-cbor-encoder');

describe('cobs-cbor-encoder module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cobsCborEncoderModule, [
            'CobsCborEncoder',
        ]);
    });

    const {
        CobsCborEncoder,
    } = cobsCborEncoderModule;

    describe('CobsCborEncoder', () => {

        it('should be a class', () => {
            expectToBeClass(CobsCborEncoder, [
                'constructor',
                'encode',
            ]);
        });

        it('constructor() should work correctly', () => {
            const enc1 = new CobsCborEncoder();

            expectObjectOwnPropertyNamesToEqual(enc1, [
                'cborEncoder',
                'cobsEncoder',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);
        });

        it('encode() should work correctly', () => {
            function expectEncodeToEqualBuffer(input, expected) {
                const enc1 = new CobsCborEncoder();

                const chunks = [];
                enc1.on('data', chunk => {
                    chunks.push(chunk);
                });

                enc1.encode(input);

                const actual = Buffer.concat(chunks).toString('hex');

                expect(actual).toBe(expected);
            }

            expectEncodeToEqualBuffer(0, '00010100');
            expectEncodeToEqualBuffer(-1, '00022000');
        });

    });

});
