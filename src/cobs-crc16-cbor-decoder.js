const EventEmitter = require('events');

const { cborDecode } = require('./cbor-decoder');
const { CobsCrc16Decoder } = require('./cobs-crc16-decoder');

class CobsCrc16CborDecoder extends EventEmitter {

    constructor(options) {
        super();

        const maxBuffer = options?.maxBuffer;

        this.cobsCrc16Decoder = new CobsCrc16Decoder({ maxBuffer });

        this.cobsCrc16Decoder.on('packet', packet => {
            const value = cborDecode(packet);
            this.emit('packet', value);
        });

        this.cobsCrc16Decoder.on('packetError', err => {
            this.emit('packetError', err);
        });
    }

    reset() {
        this.cobsCrc16Decoder.reset();
    }

    decode(buffer) {
        this.cobsCrc16Decoder.decode(buffer);
    }

}

module.exports = {
    CobsCrc16CborDecoder,
};
