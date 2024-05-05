const EventEmitter = require('events');

const { CobsEncoder } = require('./cobs-encoder');
const { Crc16 } = require('./crc16');

/**
 * A byte stream encoder to packetize using COBS including a CRC16 at the end of each packet.
 *
 * The `CobsCrc16Encoder` emits `data` events whenever a chunk of bytes has been encoded.
 */
class CobsCrc16Encoder extends EventEmitter {

    /**
     * Create a new instance.
     */
    constructor() {
        super();

        this.cobsEncoder = new CobsEncoder();
        this.crc16 = new Crc16();
        this.totalLength = 0;

        this.cobsEncoder.on('data', chunk => {
            this.emit('data', chunk);
        });

        this.reset();
    }

    /**
     * Reset the encoder.
     */
    reset() {
        this.crc16.reset();
        this.totalLength = 0;
    }

    /**
     * Flushes any buffered data including a CRC16 and a COBS packet delimiter (NUL byte).
     */
    encodeDelimiter() {
        if (this.totalLength > 0) {
            const crcBuffer = Buffer.alloc(2);
            crcBuffer.writeUInt16LE(this.crc16.finish());
            this.cobsEncoder.encodeData(crcBuffer);
        }

        this.cobsEncoder.encodeDelimiter();

        this.reset();
    }

    /**
     * Encodes a chunk of bytes.
     *
     * @param {Buffer} buffer Chunk of bytes to encode.
     */
    encodeData(buffer) {
        this.totalLength += buffer.length;
        this.crc16.update(buffer);
        this.cobsEncoder.encodeData(buffer);
    }

}

module.exports = {
    CobsCrc16Encoder,
};
