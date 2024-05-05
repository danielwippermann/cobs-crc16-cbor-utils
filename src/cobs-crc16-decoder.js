const EventEmitter = require('events');

const { CobsDecoder } = require('./cobs-decoder');
const { Crc16 } = require('./crc16');

class CobsCrc16Decoder extends EventEmitter {

    constructor(options) {
        super();

        const maxBuffer = options?.maxBuffer;

        this.cobsDecoder = new CobsDecoder({ maxBuffer });
        this.crc16 = new Crc16();

        this.cobsDecoder.on('packet', packet => {
            if (packet.length > 2) {
                this.crc16.reset();
                this.crc16.update(packet);
                if (this.crc16.verify()) {
                    this.emit('packet', packet.subarray(0, packet.length - 2));
                } else {
                    this.emit('packetError', { kind: 'CrcMismatch' });
                }
            } else {
                this.emit('packetError', { kind: 'TooSmallForCrc16', totalLength: packet.length });
            }
        });

        this.cobsDecoder.on('packetError', err => {
            this.emit('packetError', err);
        });

        this.reset();
    }

    reset() {
        this.cobsDecoder.reset();
        this.crc16.reset();
    }

    decode(buffer) {
        this.cobsDecoder.decode(buffer);
    }

}

module.exports = {
    CobsCrc16Decoder,
};
