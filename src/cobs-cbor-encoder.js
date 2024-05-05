const EventEmitter = require('events');

const { CborEncoder } = require('./cbor-encoder');
const { CobsEncoder } = require('./cobs-encoder');

class CobsCborEncoder extends EventEmitter {

    constructor() {
        super();

        this.cborEncoder = new CborEncoder();
        this.cobsEncoder = new CobsEncoder();

        this.cborEncoder.on('data', chunk => {
            this.cobsEncoder.encodeData(chunk);
        });

        this.cobsEncoder.on('data', chunk => {
            this.emit('data', chunk);
        });
    }

    encode(value) {
        this.cobsEncoder.encodeDelimiter();
        this.cborEncoder.encode(value);
        this.cobsEncoder.encodeDelimiter();
    }

}

module.exports = {
    CobsCborEncoder,
};
