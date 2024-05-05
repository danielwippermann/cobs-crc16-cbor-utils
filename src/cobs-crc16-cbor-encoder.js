const EventEmitter = require('events');

const { CborEncoder } = require('./cbor-encoder');
const { CobsCrc16Encoder } = require('./cobs-crc16-encoder');

class CobsCrc16CborEncoder extends EventEmitter {

    constructor() {
        super();

        this.cborEncoder = new CborEncoder();
        this.cobsCrc16Encoder = new CobsCrc16Encoder();

        this.cborEncoder.on('data', chunk => {
            this.cobsCrc16Encoder.encodeData(chunk);
        });

        this.cobsCrc16Encoder.on('data', chunk => {
            this.emit('data', chunk);
        });
    }

    reset() {
        this.cobsCrc16Encoder.reset();
    }

    encode(value) {
        this.cobsCrc16Encoder.encodeDelimiter();
        this.cborEncoder.encode(value);
        this.cobsCrc16Encoder.encodeDelimiter();
    }

}

module.exports = {
    CobsCrc16CborEncoder,
};
