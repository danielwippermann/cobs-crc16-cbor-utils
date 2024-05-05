const EventEmitter = require('events');

/**
 * A byte stream encoder to packetize using COBS.
 *
 * The `CobsEncoder` emits `data` events whenever a chunk of bytes has been encoded.
 */
class CobsEncoder extends EventEmitter {

    /**
     * Create a new instance.
     */
    constructor() {
        super();

        this.buffer = Buffer.alloc(256);
        this.index = 0;

        this.reset();
    }

    /**
     * Reset the encoder.
     */
    reset() {
        this.index = 0;
    }

    /**
     * Flushes any buffered data including a COBS packet delimiter (NUL byte).
     */
    encodeDelimiter() {
        if (this.index > 0) {
            this.buffer [0] = this.index;
        }

        this.buffer [this.index] = 0;
        this.index += 1;

        this.emit('data', Buffer.from(this.buffer.subarray(0, this.index)));
        this.reset();
    }

    /**
     * Encodes a chunk of bytes.
     *
     * @param {Buffer} buffer Chunk of bytes to encode.
     */
    encodeData(buffer) {
        const srcLength = buffer.length;
        let srcIndex = 0, dstIndex = this.index;

        while (srcIndex < srcLength) {
            const b = buffer [srcIndex];
            srcIndex += 1;

            if (dstIndex === 0) {
                dstIndex = 1;
            }

            if (b !== 0) {
                this.buffer [dstIndex] = b;
                dstIndex += 1;
            }

            if ((b === 0) || (dstIndex === 0xFF)) {
                this.buffer [0] = dstIndex;
                this.emit('data', Buffer.from(this.buffer.subarray(0, dstIndex)));
                dstIndex = (dstIndex === 0xFF) ? 0 : 1;
            }
        }

        this.index = dstIndex;
    }

}

module.exports = {
    CobsEncoder,
};
