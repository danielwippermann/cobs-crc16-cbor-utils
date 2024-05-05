const EventEmitter = require('events');

const { cborDecode } = require('./cbor-decoder');
const { CobsDecoder } = require('./cobs-decoder');

class CobsCborDecoder extends EventEmitter {

    constructor(options) {
        super();

        const maxBuffer = options?.maxBuffer;

        this.cobsDecoder = new CobsDecoder({ maxBuffer });

        this.cobsDecoder.on('packet', packet => {
            const value = cborDecode(packet);
            this.emit('packet', value);
        });

        this.cobsDecoder.on('packetError', err => {
            this.emit('packetError', err);
        });
    }

    reset() {
        this.cobsDecoder.reset();
    }

    decode(buffer) {
        this.cobsDecoder.decode(buffer);
    }

}

module.exports = {
    CobsCborDecoder,
};
