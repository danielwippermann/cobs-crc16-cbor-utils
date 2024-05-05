const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
} = require('./test-utils');

const cborDecoderModule = require('../src/cbor-decoder');

describe('cbor module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cborDecoderModule, [
            'cborDecode',
        ]);
    });

    const {
        cborDecode,
    } = cborDecoderModule;

    it('cborDecode() should work correctly', () => {
        function expectDecodeResultToEqual(input, expected) {
            const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'hex');
            const actual = cborDecode(buffer);
            expect(actual).toEqual(expected);
        }

        expectDecodeResultToEqual('00', 0);
        expectDecodeResultToEqual('1822', 0x22);
        expectDecodeResultToEqual('191122', 0x1122);
        expectDecodeResultToEqual('1A11223344', 0x11223344);

        expectDecodeResultToEqual('20', -1);
        expectDecodeResultToEqual('3822', -0x23);
        expectDecodeResultToEqual('391122', -0x1123);
        expectDecodeResultToEqual('3A11223344', -0x11223345);

        expectDecodeResultToEqual('40', Buffer.alloc(0));
        expectDecodeResultToEqual('4411223344', Buffer.from('11223344', 'hex'));

        expectDecodeResultToEqual('60', '');
        expectDecodeResultToEqual('6431323334', '1234');

        expectDecodeResultToEqual('80', []);
        expectDecodeResultToEqual('8401020304', [ 1, 2, 3, 4 ]);
        expectDecodeResultToEqual('9F01020304FF', [ 1, 2, 3, 4 ]);

        expectDecodeResultToEqual('A0', {});
        expectDecodeResultToEqual('A2616101616202', { a: 1, b: 2 });
        expectDecodeResultToEqual('BF616101616202FF', { a: 1, b: 2 });

        expectDecodeResultToEqual('F4', false);
        expectDecodeResultToEqual('F5', true);
        expectDecodeResultToEqual('F6', null);
        expectDecodeResultToEqual('F7', undefined);

        expect(() => {
            expectDecodeResultToEqual('FF', undefined);
        }).toThrow('Unsupported type 7/31');

        expect(() => {
            expectDecodeResultToEqual('1E', undefined);
        }).toThrow('Unsupported type 0/30');

        expect(() => {
            expectDecodeResultToEqual('C0', undefined);
        }).toThrow('Unsupported type 6/0');

        expect(() => {
            expectDecodeResultToEqual('18', undefined);
        }).toThrow('Index out of bounds');
    });

});
