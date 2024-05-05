const {
    describe,
    it,
    expect,
    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
} = require('./test-utils');

const cobsEncoderModule = require('../src/cobs-encoder');

const testData = require('./cobs-test-data');

describe('cobs-encoder module:', () => {

    expectObjectOwnPropertyNamesToEqual(cobsEncoderModule, [
        'CobsEncoder',
    ]);

    const {
        CobsEncoder,
    } = cobsEncoderModule;

    describe('CobsEncoder', () => {

        it('should be a class', () => {
            expectToBeClass(CobsEncoder, [
                'constructor',
                'reset',
                'encodeData',
                'encodeDelimiter',
            ]);
        });

        it('constructor() should work correctly', () => {
            const enc1 = new CobsEncoder();

            expectObjectOwnPropertyNamesToEqual(enc1, [
                'buffer',
                'index',

                // EventEmitter
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);

            expect(enc1.buffer).toHaveLength(256);
            expect(enc1.index).toBe(0);
        });

        it('reset() should work correctly', () => {
            const enc1 = new CobsEncoder();

            enc1.index = 123;

            enc1.reset();

            expect(enc1.index).toBe(0);
        });

        it('encodeDelimiter() should work correctly', () => {
            function expectEncodeToEqualEvents(fn, expectedEvents) {
                const enc1 = new CobsEncoder();

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
                enc.index = 3;
                enc.buffer [0] = 0;
                enc.buffer [1] = 0x11;
                enc.buffer [2] = 0x22;

                enc.encodeDelimiter();
            }, [
                [ '@data', 4 ],
                [ 'buffer', '03112200' ],
            ]);
        });

        it('encodeData() should work correctly', () => {
            function expectEncodeToEqualEvents(fn, expectedEvents) {
                const enc1 = new CobsEncoder();

                const actualEvents = [];

                const chunks = [];
                enc1.on('data', chunk => {
                    chunks.push(chunk);
                    actualEvents.push([ '@data', chunk.length ]);
                });

                fn(enc1);

                enc1.encodeDelimiter();

                actualEvents.push([ 'buffer', Buffer.concat(chunks).toString('hex') ]);

                expect(actualEvents).toEqual(expectedEvents);
            }

            expectEncodeToEqualEvents(enc => {
            }, [
                [ '@data', 1 ],
                [ 'buffer', '00' ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData1Raw);
            }, [
                [ '@data', 1 ],
                [ '@data', 2 ],
                [ 'buffer', testData.cobsTestData1Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData2Raw);
            }, [
                [ '@data', 1 ],
                [ '@data', 1 ],
                [ '@data', 2 ],
                [ 'buffer', testData.cobsTestData2Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData3Raw);
            }, [
                [ '@data', 1 ],
                [ '@data', 2 ],
                [ '@data', 2 ],
                [ 'buffer', testData.cobsTestData3Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData4Raw);
            }, [
                [ '@data', 3 ],
                [ '@data', 3 ],
                [ 'buffer', testData.cobsTestData4Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData5Raw);
            }, [
                [ '@data', 6 ],
                [ 'buffer', testData.cobsTestData5Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData6Raw);
            }, [
                [ '@data', 2 ],
                [ '@data', 1 ],
                [ '@data', 1 ],
                [ '@data', 2 ],
                [ 'buffer', testData.cobsTestData6Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData7Raw);
            }, [
                [ '@data', 255 ],
                [ '@data', 1 ],
                [ 'buffer', testData.cobsTestData7Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData8Raw);
            }, [
                [ '@data', 1 ],
                [ '@data', 255 ],
                [ '@data', 1 ],
                [ 'buffer', testData.cobsTestData8Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData9Raw);
            }, [
                [ '@data', 255 ],
                [ '@data', 3 ],
                [ 'buffer', testData.cobsTestData9Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData10Raw);
            }, [
                [ '@data', 255 ],
                [ '@data', 1 ],
                [ '@data', 2 ],
                [ 'buffer', testData.cobsTestData10Enc.toString('hex') ],
            ]);

            expectEncodeToEqualEvents(enc => {
                enc.encodeData(testData.cobsTestData11Raw.subarray(0, 1));
                enc.encodeData(testData.cobsTestData11Raw.subarray(1, 2));
                enc.encodeData(testData.cobsTestData11Raw.subarray(2, 3));
                enc.encodeData(testData.cobsTestData11Raw.subarray(3, 4));
                enc.encodeData(testData.cobsTestData11Raw.subarray(4));
            }, [
                [ '@data', 254 ],
                [ '@data', 3 ],
                [ 'buffer', testData.cobsTestData11Enc.toString('hex') ],
            ]);
        });

    });

});