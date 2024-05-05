const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cobsCrc16EncoderModule = require('../src/cobs-crc16-encoder');

describe('cobs-crc16-encoder module:', () => {

    it('should export correctly', () => {
        expectObjectOwnPropertyNamesToEqual(cobsCrc16EncoderModule, [
            'CobsCrc16Encoder',
        ]);
    });

    const {
        CobsCrc16Encoder,
    } = cobsCrc16EncoderModule;

    describe('CobsCrc16Encoder', () => {

        it('should be a class', () => {
            expectToBeClass(CobsCrc16Encoder, [
                'constructor',
                'reset',
                'encodeDelimiter',
                'encodeData',
            ]);
        });

        it('constructor() should work correctly', () => {
            const enc1 = new CobsCrc16Encoder();

            expectObjectOwnPropertyNamesToEqual(enc1, [
                'cobsEncoder',
                'crc16',
                'totalLength',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);
        });

        it('reset() should work correctly', () => {
            const enc1 = new CobsCrc16Encoder();

            enc1.reset();
        });

        it('encodeDelimiter() should work correctly', () => {
            function expectEncodeToEqualEvents(fn, expectedEvents) {
                const enc1 = new CobsCrc16Encoder();

                const actualEvents = [];

                const chunks = [];
                enc1.on('data', chunk => {
                    chunks.push(chunk);
                    actualEvents.push([ '@data', chunk.length ]);
                });

                fn(enc1);

                actualEvents.push([ 'buffer', Buffer.concat(chunks).toString('hex') ]);

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectEncodeToEqualEvents(enc => {
                enc.encodeDelimiter();
            }, [
                [ '@data', 1 ],
                [ 'buffer', '00' ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeDelimiter();
                enc.encodeDelimiter();
            }, [
                [ '@data', 1 ],
                [ '@data', 1 ],
                [ 'buffer', '0000' ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.totalLength = 1;
                enc.encodeDelimiter();
            }, [
                [ '@data', 1 ],
                [ '@data', 1 ],
                [ '@data', 2 ],
                [ 'buffer', '01010100' ],
            ]);
        });

        it('encodeData() should work correctly', () => {
            function expectEncodeToEqualEvents(fn, expectedEvents) {
                const enc1 = new CobsCrc16Encoder();

                const actualEvents = [];

                const chunks = [];
                enc1.on('data', chunk => {
                    chunks.push(chunk);
                    actualEvents.push([ '@data', chunk.length ]);
                });

                fn(enc1);

                actualEvents.push([ 'buffer', Buffer.concat(chunks).toString('hex') ]);

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectEncodeToEqualEvents(enc => {
                enc.encodeDelimiter();
                enc.encodeData(Buffer.from('8300108100', 'hex'));
                enc.encodeDelimiter();
            }, [
                [ '@data', 1 ],
                [ '@data', 2 ],
                [ '@data', 3 ],
                [ '@data', 4 ],
                [ 'buffer', '000283031081036f4800' ],
            ]);
        });

    });

});
