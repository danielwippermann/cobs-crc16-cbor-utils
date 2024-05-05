const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cborEncoderModule = require('../src/cbor-encoder');

describe('cbor module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cborEncoderModule, [
            'CborEncoder',
            'cborEncode',
        ]);
    });

    const {
        CborEncoder,
        cborEncode,
    } = cborEncoderModule;

    describe('CborEncoder', () => {

        it('should be a class', () => {
            expectToBeClass(CborEncoder, [
                'constructor',
                '_flush',
                '_allocSlice',
                '_concatSlice',
                '_encodeMajorAndMinorType',
                '_encodeMajorTypeAndArg',
                '_encode',
                'encode',
            ]);
        });

        it('constructor() should work correctly', () => {
            const enc1 = new CborEncoder();

            expectObjectOwnPropertyNamesToEqual(enc1, [
                'buffer',
                'index',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);

            expect(enc1.buffer).toHaveLength(512);
            expect(enc1.index).toBe(0);
        });

        it('_flush() should work correctly', () => {
            function expectToEqualEvents(fn, expectedEvents, options) {
                const enc1 = new CborEncoder(options);

                const actualEvents = [];

                enc1.on('data', chunk => {
                    actualEvents.push([ '@data', chunk.length ]);
                });

                fn(enc1);

                expect(enc1.index).toBe(0);

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectToEqualEvents(enc => {
                enc._flush();
            }, []);

            expectToEqualEvents(enc => {
                enc.index = 123;
                enc._flush();
            }, [
                [ '@data', 123 ],
            ]);
        });

        it('_allocSlice() should work correctly', () => {
            function expectToEqualEvents(fn, expectedEvents, options) {
                const enc1 = new CborEncoder(options);

                const actualEvents = [];

                enc1.on('data', chunk => {
                    actualEvents.push([ '@data', chunk.length ]);
                });

                fn(enc1);

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectToEqualEvents(enc => {
                expect(enc.index).toBe(0);

                const slice1 = enc._allocSlice(123);
                expect(slice1).toHaveLength(123);

                expect(enc.index).toBe(123);
            }, []);

            expectToEqualEvents(enc => {
                expect(enc.index).toBe(0);

                const slice1 = enc._allocSlice(123);
                expect(slice1).toHaveLength(123);

                expect(enc.index).toBe(123);

                const slice2 = enc._allocSlice(123);
                expect(slice2).toHaveLength(123);

                expect(enc.index).toBe(246);
            }, []);

            expectToEqualEvents(enc => {
                expect(enc.index).toBe(0);

                const slice1 = enc._allocSlice(123);
                expect(slice1).toHaveLength(123);

                expect(enc.index).toBe(123);

                const slice2 = enc._allocSlice(500);
                expect(slice2).toHaveLength(500);

                expect(enc.index).toBe(500);
            }, [
                [ '@data', 123 ],
            ]);

            expect(() => {
                expectToEqualEvents(enc => {
                    enc._allocSlice(1024);
                });
            }).toThrow('Invalid slice size');
        });

        it('_concatSlice() should work correctly', () => {
            function expectToEqualEvents(fn, expectedEvents, options) {
                const enc1 = new CborEncoder(options);

                const actualEvents = [];

                enc1.on('data', chunk => {
                    actualEvents.push([ '@data', chunk.length ]);
                });

                fn(enc1);

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectToEqualEvents(enc => {
                enc._concatSlice(Buffer.from('11223344', 'hex'));

                expect(enc.index).toBe(4);
                expect(enc.buffer.subarray(0, 4).toString('hex')).toBe('11223344');

                enc._concatSlice(Buffer.from('55667788', 'hex'));

                expect(enc.index).toBe(8);
                expect(enc.buffer.subarray(0, 8).toString('hex')).toBe('1122334455667788');
            }, []);

            expectToEqualEvents(enc => {
                enc.index = 123;

                enc._concatSlice(Buffer.alloc(1234));
            }, [
                [ '@data', 123 ],
                [ '@data', 1234 ],
            ]);
        });

        it('_encodeMajorAndMinorType() should work correctly', () => {
            const enc1 = new CborEncoder();

            enc1._encodeMajorAndMinorType(1, 12);

            expect(enc1.index).toBe(1);
            expect(enc1.buffer [0]).toBe(0x2c);
        });

        it('_encodeMajorTypeAndArg() should work correctly', () => {
            function expectEncodeToEqual(major, arg, expected) {
                const enc1 = new CborEncoder();

                enc1._encodeMajorTypeAndArg(major, arg);

                expect(enc1.buffer.subarray(0, enc1.index).toString('hex')).toBe(expected);
            }

            expectEncodeToEqual(0, 0, '00');
            expectEncodeToEqual(1, 0x11, '31');
            expectEncodeToEqual(2, 0x22, '5822');
            expectEncodeToEqual(3, 0x1122, '791122');
            expectEncodeToEqual(4, 0x11223344, '9a11223344');

            expect(() => {
                expectEncodeToEqual(0, 0x100000000);
            }).toThrow('Unsupported arg');
        });

        it('encode() should work correctly', () => {
            function expectEncodeToEqual(value, expected) {
                const enc1 = new CborEncoder();

                const chunks = [];
                enc1.on('data', chunk => {
                    chunks.push(chunk);
                });

                enc1.encode(value);

                const buffer = Buffer.concat(chunks);
                expect(buffer.toString('hex')).toBe(expected);
            }

            expectEncodeToEqual(0, '00');
            expectEncodeToEqual(0x22, '1822');
            expectEncodeToEqual(0x1122, '191122');
            expectEncodeToEqual(0x11223344, '1a11223344');

            expectEncodeToEqual(-1, '20');
            expectEncodeToEqual(-0x23, '3822');
            expectEncodeToEqual(-0x1123, '391122');
            expectEncodeToEqual(-0x11223345, '3a11223344');

            expectEncodeToEqual(Buffer.alloc(0), '40');
            expectEncodeToEqual(Buffer.from('11223344', 'hex'), '4411223344');

            expectEncodeToEqual('', '60');
            expectEncodeToEqual('1234', '6431323334');

            expectEncodeToEqual([], '80');
            expectEncodeToEqual([ 1, 2, 3, 4 ], '8401020304');

            expectEncodeToEqual({}, 'a0');
            expectEncodeToEqual({ a: 1, b: 2 }, 'a2616101616202');

            expectEncodeToEqual(new Map(), 'a0');
            expectEncodeToEqual(new Map([[ 'a', 1 ], [ 'b', 2 ] ]), 'a2616101616202');

            expectEncodeToEqual(false, 'f4');
            expectEncodeToEqual(true, 'f5');
            expectEncodeToEqual(null, 'f6');
            expectEncodeToEqual(undefined, 'f7');

            expect(() => {
                expectEncodeToEqual(Symbol.iterator);
            }).toThrow('Unsupported value type symbol');
        });

    });

    it('cborEncode() should work correctly', () => {
        function expectEncodeResultToEqual(input, expected) {
            const actual = cborEncode(input);
            expect(actual.toString('hex')).toEqual(expected);
        }

        expectEncodeResultToEqual(0, '00');
        expectEncodeResultToEqual(0x22, '1822');
        expectEncodeResultToEqual(0x1122, '191122');
        expectEncodeResultToEqual(0x11223344, '1a11223344');

        expectEncodeResultToEqual(-1, '20');
        expectEncodeResultToEqual(-0x23, '3822');
        expectEncodeResultToEqual(-0x1123, '391122');
        expectEncodeResultToEqual(-0x11223345, '3a11223344');

        expectEncodeResultToEqual(Buffer.alloc(0), '40');
        expectEncodeResultToEqual(Buffer.from('11223344', 'hex'), '4411223344');

        expectEncodeResultToEqual('', '60');
        expectEncodeResultToEqual('1234', '6431323334');

        expectEncodeResultToEqual([], '80');
        expectEncodeResultToEqual([ 1, 2, 3, 4 ], '8401020304');

        expectEncodeResultToEqual({}, 'a0');
        expectEncodeResultToEqual({ a: 1, b: 2 }, 'a2616101616202');

        expectEncodeResultToEqual(new Map(), 'a0');
        expectEncodeResultToEqual(new Map([ [ 'a', 1 ], [ 'b', 2 ] ]), 'a2616101616202');

        expectEncodeResultToEqual(false, 'f4');
        expectEncodeResultToEqual(true, 'f5');
        expectEncodeResultToEqual(null, 'f6');
        expectEncodeResultToEqual(undefined, 'f7');

        const buffer1 = cborEncode([ Buffer.alloc(1024), Buffer.alloc(1024) ]);
        expect(buffer1.toString('hex')).toMatch(/^82590400(00){1024}590400(00){1024}$/);

        expect(() => {
            cborEncode(0x100000000);
        }).toThrow('Unsupported arg');

        expect(() => {
            cborEncode(Symbol.iterator);
        }).toThrow('Unsupported value type symbol');
    });
});
