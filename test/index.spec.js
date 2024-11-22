const {
    describe,
    it,
    expectObjectOwnPropertyNamesToEqual,
} = require('./test-utils');

const indexModule = require('../src/index');

describe('index module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(indexModule, [
            'Crc16',

            'CborDecoder',
            'cborDecode',

            'CborEncoder',
            'cborEncode',

            'CobsDecoder',
            'CobsEncoder',

            'CobsCrc16Decoder',
            'CobsCrc16Encoder',

            'CobsCborDecoder',
            'CobsCborEncoder',

            'CobsCrc16CborDecoder',
            'CobsCrc16CborEncoder',
        ]);
    });

});
