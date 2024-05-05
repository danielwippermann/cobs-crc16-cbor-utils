const EventEmitter = require('events');

class CobsDecoder extends EventEmitter {

    /**
     * Creates a new decoder instance.
     *
     * @param {object?} options Optional configuration object
     * @param {number} options.maxBuffer
     */
    constructor(options) {
        super();

        const maxBuffer = options?.maxBuffer ?? 512;

        this.blockBuffer = Buffer.alloc(256);
        this.buffer = Buffer.alloc(maxBuffer);

        this.reset();
    }

    /**
     * Reset the decoder to initial state.
     */
    reset() {
        this.blockStart = 0xFF;
        this.blockIndex = 0xFF;
        this.blockLength = 0xFF;
        this.bufferIndex = 0;
        this.totalLength = 0;
    }

    /**
     *
     * @param {Buffer} buffer A partial or complete chunk of COBS encoded data.
     */
    decode(buffer) {
        for (let idx = 0; idx < buffer.length; idx++) {
            const b = buffer [idx];

            if (this.blockIndex < this.blockLength) {
                if (b !== 0) {
                    this.blockBuffer [this.blockIndex] = b;
                    this.blockIndex += 1;
                } else {
                    this.emit('packetError', { kind: 'UnexpectedZero' });
                    this.reset();
                }
            } else {
                // b is either a terminating 0 or the length of the next block
                if ((b !== 0) && (this.blockLength !== 0xFF)) {
                    this.blockBuffer [this.blockIndex] = 0;
                    this.blockIndex += 1;
                }

                if (this.blockStart < this.blockIndex) {
                    const block = this.blockBuffer.subarray(this.blockStart, this.blockIndex);

                    const srcLength = block.length, dstLength = this.buffer.length;
                    let srcIndex = 0, dstIndex = this.bufferIndex;
                    while ((srcIndex < srcLength) && (dstIndex < dstLength)) {
                        this.buffer [dstIndex] = block [srcIndex];
                        srcIndex += 1;
                        dstIndex += 1;
                    }

                    this.bufferIndex = dstIndex;

                    this.totalLength += block.length;
                    this.emit('packetBlock', block);
                }

                if (b !== 0) {
                    this.blockStart = 1;
                    this.blockIndex = 1;
                    this.blockLength = b;
                } else {
                    this.emit('packetEnd', this.totalLength);

                    if (this.bufferIndex > 0) {
                        if (this.bufferIndex === this.totalLength) {
                            this.emit('packet', this.buffer.subarray(0, this.bufferIndex));
                        } else {
                            this.emit('packetError', { kind: 'Overflow', totalLength: this.totalLength });
                        }
                    }

                    this.reset();
                }
            }
        }
    }

}

module.exports = {
    CobsDecoder,
};
