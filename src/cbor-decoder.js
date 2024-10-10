const INDEFINITE_LENGTH = Symbol();

class Decoder {

    constructor(buffer) {
        this.buffer = buffer;
        this.index = 0;
    }

    ensureLength(length) {
        if (this.index + length > this.buffer.length) {
            throw new Error(`Index out of bounds`);
        }
    }

    consume(length) {
        this.ensureLength(length);
        this.index += length;
    }

    peekMajorAndMinorType() {
        this.ensureLength(1);
        const b = this.buffer [this.index];
        return [ b >> 5, b & 0x1F ];
    }

    peekMajorTypeAndArg() {
        const [ major, minor ] = this.peekMajorAndMinorType();
        let arg, length;
        if (minor < 0x18) {
            arg = minor;
            length = 1;
        } else if (minor === 0x18) {
            arg = this.buffer [this.index + 1];
            length = 2;
        } else if (minor === 0x19) {
            arg = this.buffer.readUInt16BE(this.index + 1);
            length = 3;
        } else if (minor === 0x1A) {
            arg = this.buffer.readUInt32BE(this.index + 1);
            length = 5;
        } else if (minor === 0x1F) {
            arg = INDEFINITE_LENGTH;
            length = 1;
        } else {
            throw new Error(`Unsupported type ${major}/${minor}`);
        }

        this.ensureLength(length);

        return [ major, minor, arg, length ];
    }

    decodeIfIndefiniteLengthBreak() {
        const [ major, minor ] = this.peekMajorAndMinorType();
        const isBreak = ((major === 7) && (minor === 0x1F));
        if (isBreak) {
            this.consume(1);
        }
        return isBreak;
    }

    decode() {
        const [ major, minor, arg, length ] = this.peekMajorTypeAndArg();
        this.consume(length);

        let result;
        if (major === 0) {
            result = arg;
        } else if (major === 1) {
            result = -1 - arg;
        } else if (major === 2) {
            result = this.buffer.subarray(this.index, this.index + arg);
            this.consume(arg);
        } else if (major === 3) {
            result = this.buffer.subarray(this.index, this.index + arg).toString();
            this.consume(arg);
        } else if (major === 4) {
            if (arg !== INDEFINITE_LENGTH) {
                result = new Array(arg);
                for (let i = 0; i < arg; i++) {
                    result [i] = this.decode();
                }
            } else {
                result = [];
                while (!this.decodeIfIndefiniteLengthBreak()) {
                    result.push(this.decode());
                }
            }
        } else if (major === 5) {
            result = {};
            if (arg !== INDEFINITE_LENGTH) {
                for (let i = 0; i < arg; i++) {
                    const key = this.decode();
                    const value = this.decode();
                    result [key] = value;
                }
            } else {
                while (!this.decodeIfIndefiniteLengthBreak()) {
                    const key = this.decode();
                    const value = this.decode();
                    result [key] = value;
                }
            }
        } else if (major === 7) {
            if (minor === 20) {
                result = false;
            } else if (minor === 21) {
                result = true;
            } else if (minor === 22) {
                result = null;
            } else if (minor === 23) {
                result = undefined;
            } else if (minor === 26) {
                const buffer = Buffer.alloc(4);
                buffer.writeUInt32BE(arg, 0);
                result = buffer.readFloatBE(0);
            } else {
                throw new Error(`Unsupported type ${major}/${minor}`);
            }
        } else {
            throw new Error(`Unsupported type ${major}/${minor}`);
        }

        return result;
    }

}

function cborDecode(buffer) {
    const decoder = new Decoder(buffer);
    return decoder.decode();
}

module.exports = {
    cborDecode,
};
