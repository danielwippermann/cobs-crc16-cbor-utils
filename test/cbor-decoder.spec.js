const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cborDecoderModule = require('../src/cbor-decoder');

describe('cbor module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cborDecoderModule, [
            'CborDecoder',
            'cborDecode',
        ]);
    });

    const {
        CborDecoder,
        cborDecode,
    } = cborDecoderModule;


    describe('CborDecoder', () => {

        it('should be a class', () => {
            expectToBeClass(CborDecoder, [
                'constructor',
                'ensureLength',
                'consume',
                'peekMajorTypeAndArg',
                'decodeMajorTypeAndArg',
                'decodeUInteger',
                'decodeInteger',
                'decodeBytes',
                'decodeString',
                'decodeArrayHead',
                'decodeMapHead',
                'decodeBoolean',
                'decodeIfNull',
                'decodeNull',
                'decodeUndefined',
                'decodeFloat32',
                'decodeIfIndefiniteLengthBreak',
                'decode',
            ], [
                'INDEFINITE_LENGTH',
            ]);
        });

        function decoderFromDump(dump) {
            const buffer = Buffer.from(dump.replaceAll(' ', ''), 'hex');
            return new CborDecoder(buffer);
        }

        it('ensureLength', () => {
            const decoder1 = decoderFromDump('00');
            expect(decoder1.index).toBe(0);
            expect(decoder1.ensureLength(0)).toBe(0);
            expect(decoder1.ensureLength(1)).toBe(1);
            expect(() => {
                decoder1.ensureLength(2);
            }).toThrow('Index out of bounds');
        });

        it('consume()', () => {
            const decoder1 = decoderFromDump('00');
            expect(decoder1.index).toBe(0);
            decoder1.consume(0);
            expect(decoder1.index).toBe(0);
            decoder1.consume(1);
            expect(decoder1.index).toBe(1);
            expect(() => {
                decoder1.consume(1);
            }).toThrow('Index out of bounds');
        });

        it('peekMajorTypeAndArg()', () => {
            const decoder1 = decoderFromDump('5F');
            const result = decoder1.peekMajorTypeAndArg();
            expectObjectOwnPropertyNamesToEqual(result, [
                'major',
                'minor',
                'length',
                'arg',
            ]);
            expect(result.major).toBe(2);
            expect(result.minor).toBe(0x1F);
            expect(result.length).toBe(1);
            expect(result.arg).toBe(CborDecoder.INDEFINITE_LENGTH);
        });

        it('decodeMajorTypeAndArg()', () => {
            const decoder1 = decoderFromDump('5F');
            const result = decoder1.decodeMajorTypeAndArg();
            expectObjectOwnPropertyNamesToEqual(result, [
                'major',
                'minor',
                'length',
                'arg',
                'buffer',
            ]);
            expect(result.major).toBe(2);
            expect(result.minor).toBe(0x1F);
            expect(result.length).toBe(1);
            expect(result.arg).toBe(CborDecoder.INDEFINITE_LENGTH);
            expect(result.buffer).toHaveLength(1);
            expect(result.buffer [0]).toBe(0x5F);
            expect(() => {
                decoder1.decodeMajorTypeAndArg();
            }).toThrow('Index out of bounds');
        });

        it('decodeUInteger()', () => {
            const decoder1 = decoderFromDump('10 1820 193031 1A40414243 20');
            expect(decoder1.decodeUInteger()).toEqual(0x10);
            expect(decoder1.decodeUInteger()).toEqual(0x20);
            expect(decoder1.decodeUInteger()).toEqual(0x3031);
            expect(decoder1.decodeUInteger()).toEqual(0x40414243);
            expect(() => {
                decoder1.decodeUInteger();
            }).toThrow('Expected major type to be 0, but got 1');
        });

        it('decodeInteger()', () => {
            const decoder1 = decoderFromDump('10 1820 193031 1A40414243 30 3820 393031 3A40414243 40');
            expect(decoder1.decodeInteger()).toBe(0x10);
            expect(decoder1.decodeInteger()).toBe(0x20);
            expect(decoder1.decodeInteger()).toBe(0x3031);
            expect(decoder1.decodeInteger()).toBe(0x40414243);
            expect(decoder1.decodeInteger()).toBe(-0x11);
            expect(decoder1.decodeInteger()).toBe(-0x21);
            expect(decoder1.decodeInteger()).toBe(-0x3032);
            expect(decoder1.decodeInteger()).toBe(-0x40414244);
            expect(() => {
                decoder1.decodeInteger();
            }).toThrow('Expected major type to be 0 or 1, but got 2');
        });

        it('decodeBytes()', () => {
            const decoder1 = decoderFromDump('4548656C6C6F 00');
            expect(decoder1.decodeBytes().toString('hex')).toBe('48656c6c6f');
            expect(() => {
                decoder1.decodeBytes();
            }).toThrow('Expected major type to be 2, but got 0');
        });

        it('decodeString()', () => {
            const decoder1 = decoderFromDump('6548656C6C6F 00');
            expect(decoder1.decodeString()).toBe('Hello');
            expect(() => {
                decoder1.decodeString();
            }).toThrow('Expected major type to be 3, but got 0');
        });

        it('decodeArrayHead()', () => {
            const decoder1 = decoderFromDump('82 9F 00');
            expect(decoder1.decodeArrayHead()).toBe(2);
            expect(decoder1.decodeArrayHead()).toBe(CborDecoder.INDEFINITE_LENGTH);
            expect(() => {
                decoder1.decodeArrayHead();
            }).toThrow('Expected major type to be 4, but got 0');
        });

        it('decodeMapHead()', () => {
            const decoder1 = decoderFromDump('A2 BF 00');
            expect(decoder1.decodeMapHead()).toBe(2);
            expect(decoder1.decodeMapHead()).toBe(CborDecoder.INDEFINITE_LENGTH);
            expect(() => {
                decoder1.decodeMapHead();
            }).toThrow('Expected major type to be 5, but got 0');
        });

        it('decodeBoolean()', () => {
            const decoder1 = decoderFromDump('F4 F5 00 E0');
            expect(decoder1.decodeBoolean()).toBe(false);
            expect(decoder1.decodeBoolean()).toBe(true);
            expect(() => {
                decoder1.decodeBoolean();
            }).toThrow('Expected major type to be 7, but got 0');
            expect(() => {
                decoder1.decodeBoolean();
            }).toThrow('Expected minor type to be 20 or 21, but got 0');
        });

        it('decodeIfNull()', () => {
            const decoder1 = decoderFromDump('F6 00');
            expect(decoder1.decodeIfNull()).toBe(true);
            expect(decoder1.decodeIfNull()).toBe(false);
            expect(decoder1.peekMajorTypeAndArg()).toEqual({
                major: 0,
                minor: 0,
                arg: 0,
                length: 1,
            });
        });

        it('decodeNull()', () => {
            const decoder1 = decoderFromDump('F6 00 E0');
            expect(decoder1.decodeNull()).toBe(null);
            expect(() => {
                decoder1.decodeNull();
            }).toThrow('Expected major type to be 7, but got 0');
            expect(() => {
                decoder1.decodeNull();
            }).toThrow('Expected minor type to be 22, but got 0');
        });

        it('decodeUndefined()', () => {
            const decoder1 = decoderFromDump('F7 00 E0');
            expect(decoder1.decodeUndefined()).toBe(undefined);
            expect(() => {
                decoder1.decodeUndefined();
            }).toThrow('Expected major type to be 7, but got 0');
            expect(() => {
                decoder1.decodeUndefined();
            }).toThrow('Expected minor type to be 23, but got 0');
        });

        it('decodeFloat32()', () => {
            const decoder1 = decoderFromDump('FA461C4200 00 E0');
            expect(decoder1.decodeFloat32()).toBe(10000.5);
            expect(() => {
                decoder1.decodeFloat32();
            }).toThrow('Expected major type to be 7, but got 0');
            expect(() => {
                decoder1.decodeFloat32();
            }).toThrow('Expected minor type to be 26, but got 0');
        });

        it('decodeIfIndefiniteLengthBreak', () => {
            const decoder1 = decoderFromDump('FF 00');
            expect(decoder1.decodeIfIndefiniteLengthBreak()).toBe(true);
            expect(decoder1.decodeIfIndefiniteLengthBreak()).toBe(false);
            expect(decoder1.peekMajorTypeAndArg()).toEqual({
                major: 0,
                minor: 0,
                arg: 0,
                length: 1,
            });
        });

        it('decode', () => {
            function expectDecodeResultToEqual(input, expected) {
                const decoder1 = decoderFromDump(input);
                const actual = decoder1.decode();
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

            expectDecodeResultToEqual('FA461C4200', 10000.5);
        });

    });

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

        expectDecodeResultToEqual('FA461C4200', 10000.5);

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
