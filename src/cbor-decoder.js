const INDEFINITE_LENGTH = Symbol();

class CborDecoder {

    constructor(buffer) {
        this.buffer = buffer;
        this.index = 0;
    }

    ensureLength(length) {
        if (this.index + length > this.buffer.length) {
            throw new Error(`Index out of bounds`);
        }
        return length;
    }

    consume(length) {
        this.ensureLength(length);
        const result = this.buffer.subarray(this.index, this.index + length);
        this.index += length;
        return result;
    }

    peekMajorTypeAndArg() {
        let length = this.ensureLength(1);
        const b = this.buffer [this.index];
        const major = b >> 5;
        const minor = b & 0x1F;
        let arg;
        if (minor < 0x18) {
            arg = minor;
        } else if (minor === 0x18) {
            length = this.ensureLength(2);
            arg = this.buffer [this.index + 1];
        } else if (minor === 0x19) {
            length = this.ensureLength(3);
            arg = this.buffer.readUInt16BE(this.index + 1);
        } else if (minor === 0x1A) {
            length = this.ensureLength(5);
            arg = this.buffer.readUInt32BE(this.index + 1);
        } else if (minor === 0x1F) {
            arg = INDEFINITE_LENGTH;
        } else {
            throw new Error(`Unsupported type ${major}/${minor}`);
        }

        return { major, minor, arg, length };
    }

    decodeMajorTypeAndArg() {
        const result = this.peekMajorTypeAndArg();
        result.buffer = this.consume(result.length);
        return result;
    }

    decodeUInteger() {
        const { major, arg } = this.decodeMajorTypeAndArg();
        if (major !== 0) {
            throw new Error(`Expected major type to be 0, but got ${major}`);
        }
        return arg;
    }

    decodeInteger() {
        const { major, arg } = this.decodeMajorTypeAndArg();
        let result;
        if (major === 0) {
            result = arg;
        } else if (major === 1) {
            result = -1 - arg;
        } else {
            throw new Error(`Expected major type to be 0 or 1, but got ${major}`);
        }
        return result;
    }

    decodeBytes() {
        const { major, arg } = this.decodeMajorTypeAndArg();
        if (major !== 2) {
            throw new Error(`Expected major type to be 2, but got ${major}`);
        }
        return this.consume(arg);
    }

    decodeString() {
        const { major, arg } = this.decodeMajorTypeAndArg();
        if (major !== 3) {
            throw new Error(`Expected major type to be 3, but got ${major}`);
        }
        const bytes = this.consume(arg);
        return bytes.toString();
    }

    decodeArrayHead() {
        const { major, arg } = this.decodeMajorTypeAndArg();
        if (major !== 4) {
            throw new Error(`Expected major type to be 4, but got ${major}`);
        }
        return arg;
    }

    decodeMapHead() {
        const { major, arg } = this.decodeMajorTypeAndArg();
        if (major !== 5) {
            throw new Error(`Expected major type to be 5, but got ${major}`);
        }
        return arg;
    }

    decodeBoolean() {
        const { major, minor } = this.decodeMajorTypeAndArg();
        let result;
        if (major !== 7) {
            throw new Error(`Expected major type to be 7, but got ${major}`);
        } else if (minor === 20) {
            result = false;
        } else if (minor === 21) {
            result = true;
        } else {
            throw new Error(`Expected minor type to be 20 or 21, but got ${minor}`);
        }
        return result;
    }

    decodeIfNull() {
        const { major, minor } = this.peekMajorTypeAndArg();
        if ((major === 7) && (minor === 22)) {
            this.consume(1);
            return true;
        } else {
            return false;
        }
    }

    decodeNull() {
        const { major, minor } = this.decodeMajorTypeAndArg();
        if (major !== 7) {
            throw new Error(`Expected major type to be 7, but got ${major}`);
        } else if (minor !== 22) {
            throw new Error(`Expected minor type to be 22, but got ${minor}`);
        }
        return null;
    }

    decodeUndefined() {
        const { major, minor } = this.decodeMajorTypeAndArg();
        if (major !== 7) {
            throw new Error(`Expected major type to be 7, but got ${major}`);
        } else if (minor !== 23) {
            throw new Error(`Expected minor type to be 23, but got ${minor}`);
        }
        return undefined;
    }

    decodeFloat32() {
        const { major, minor, buffer } = this.decodeMajorTypeAndArg();
        if (major !== 7) {
            throw new Error(`Expected major type to be 7, but got ${major}`);
        } else if (minor !== 26) {
            throw new Error(`Expected minor type to be 26, but got ${minor}`);
        }
        return buffer.readFloatBE(1);
    }

    decodeIfIndefiniteLengthBreak() {
        const { major, minor } = this.peekMajorTypeAndArg();
        if ((major === 7) && (minor === 31)) {
            this.consume(1);
            return true;
        } else {
            return false;
        }
    }

    decode() {
        const { major, minor, arg, buffer } = this.decodeMajorTypeAndArg();

        let result;
        if (major === 0) {
            result = arg;
        } else if (major === 1) {
            result = -1 - arg;
        } else if (major === 2) {
            result = this.consume(arg);
        } else if (major === 3) {
            result = this.consume(arg).toString();
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
            if (minor === 0x14) {
                result = false;
            } else if (minor === 0x15) {
                result = true;
            } else if (minor === 0x16) {
                result = null;
            } else if (minor === 0x17) {
                result = undefined;
            } else if (minor === 0x1A) {
                result = buffer.readFloatBE(1);
            } else {
                throw new Error(`Unsupported type ${major}/${minor}`);
            }
        } else {
            throw new Error(`Unsupported type ${major}/${minor}`);
        }
        return result;
    }

}

CborDecoder.INDEFINITE_LENGTH = INDEFINITE_LENGTH;

function cborDecode(buffer) {
    const decoder = new CborDecoder(buffer);
    return decoder.decode();
}

module.exports = {
    CborDecoder,
    cborDecode,
};
