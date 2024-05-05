const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cobsCrc16CborEncoderModule = require('../src/cobs-crc16-cbor-encoder');

describe('cobs-crc16-cbor-encoder module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cobsCrc16CborEncoderModule, [
            'CobsCrc16CborEncoder',
        ]);
    });

    const {
        CobsCrc16CborEncoder,
    } = cobsCrc16CborEncoderModule;

    describe('CobsCrc16CborEncoder', () => {

        it('should be a class', () => {
            expectToBeClass(CobsCrc16CborEncoder, [
                'constructor',
                'reset',
                'encode',
            ]);
        });

        it('constructor() should work correctly', () => {
            const enc1 = new CobsCrc16CborEncoder();

            expectObjectOwnPropertyNamesToEqual(enc1, [
                'cborEncoder',
                'cobsCrc16Encoder',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);
        });

        it('reset() should work correctly', () => {
            const enc1 = new CobsCrc16CborEncoder();

            enc1.reset();
        });

        it('encode() should work correctly', () => {
            function expectEncodeToEqualEvents(input, expectedEvents) {
                const enc1 = new CobsCrc16CborEncoder();

                const actualEvents = [];

                const chunks = [];
                enc1.on('data', chunk => {
                    chunks.push(chunk);
                    actualEvents.push([ '@data', chunk.length ]);
                });

                enc1.encode(input);

                actualEvents.push([ 'buffer', Buffer.concat(chunks).toString('hex') ]);

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectEncodeToEqualEvents(0, [
                [ '@data', 1 ],
                [ '@data', 1 ],
                [ '@data', 4 ],
                [ 'buffer', '00010378f000' ],
            ]);

            expectEncodeToEqualEvents(-1, [
                [ '@data', 1 ],
                [ '@data', 5 ],
                [ 'buffer', '0004207ad100' ],
            ]);

            expectEncodeToEqualEvents([ 0, 16, [ 0 ] ], [
                [ '@data', 1 ],
                [ '@data', 2 ],
                [ '@data', 3 ],
                [ '@data', 4 ],
                [ 'buffer', '000283031081036f4800' ],
            ]);
        });

    });

});
