const EventEmitter = require('events');

class CborEncoder extends EventEmitter {

    constructor(options) {
        super();

        const maxBuffer = options?.maxBuffer ?? 512;

        this.buffer = Buffer.alloc(maxBuffer);
        this.index = 0;
    }

    _flush() {
        if (this.index > 0) {
            const buffer = Buffer.from(this.buffer.subarray(0, this.index));
            this.index = 0;

            this.emit('data', buffer);
        }
    }

    _allocSlice(length) {
        if (length > this.buffer.length) {
            throw new Error('Invalid slice size');
        }

        if ((this.index + length) > this.buffer.length) {
            this._flush();
        }

        const buffer = this.buffer.subarray(this.index, this.index + length);
        this.index += length;

        buffer.fill(0);

        return buffer;
    }

    _concatSlice(buffer) {
        if (buffer.length > this.buffer.length) {
            this._flush();
            this.emit('data', Buffer.from(buffer));
        } else {
            const slice = this._allocSlice(buffer.length);
            buffer.copy(slice);
        }
    }

    _encodeMajorAndMinorType(major, minor) {
        const buffer = this._allocSlice(1);
        buffer [0] = (major << 5) | (minor & 0x1F);
    }

    _encodeMajorTypeAndArg(major, arg) {
        if (arg < 0x18) {
            this._encodeMajorAndMinorType(major, arg);
        } else if (arg <= 0xFF) {
            this._encodeMajorAndMinorType(major, 0x18);
            this._allocSlice(1) [0] = arg;
        } else if (arg <= 0xFFFF) {
            this._encodeMajorAndMinorType(major, 0x19);
            this._allocSlice(2).writeUInt16BE(arg);
        } else if (arg <= 0xFFFFFFFF) {
            this._encodeMajorAndMinorType(major, 0x1A);
            this._allocSlice(4).writeUInt32BE(arg);
        } else {
            throw new Error('Unsupported arg');
        }
    }

    _encode(value) {
        if (typeof value === 'number') {
            if (!Number.isInteger(value)) {
                const buffer = Buffer.alloc(4);
                buffer.writeFloatBE(value, 0);
                this._encodeMajorAndMinorType(7, 0x1A);
                this._concatSlice(buffer);
            } else if (value >= 0) {
                this._encodeMajorTypeAndArg(0, value);
            } else {
                const absValue = -1 - value;
                this._encodeMajorTypeAndArg(1, absValue);
            }
        } else if (Buffer.isBuffer(value)) {
            this._encodeMajorTypeAndArg(2, value.length);
            this._concatSlice(value);
        } else if (typeof value === 'string') {
            const buffer = Buffer.from(value, 'utf-8');
            this._encodeMajorTypeAndArg(3, buffer.length);
            this._concatSlice(buffer);
        } else if (Array.isArray(value)) {
            this._encodeMajorTypeAndArg(4, value.length);
            for (let i = 0; i < value.length; i++) {
                this._encode(value [i]);
            }
        } else if (typeof value === 'boolean') {
            if (value) {
                this._encodeMajorAndMinorType(7, 21);
            } else {
                this._encodeMajorAndMinorType(7, 20);
            }
        } else if (value === null) {
            this._encodeMajorAndMinorType(7, 22);
        } else if (value === undefined) {
            this._encodeMajorAndMinorType(7, 23);
        } else if (value instanceof Map) {
            const keys = Array.from(value.keys());
            this._encodeMajorTypeAndArg(5, keys.length);
            for (let i = 0; i < keys.length; i++) {
                const key = keys [i];
                this._encode(key);
                this._encode(value.get(key));
            }
        } else if (typeof value === 'object') {
            const keys = Object.getOwnPropertyNames(value);
            this._encodeMajorTypeAndArg(5, keys.length);
            for (let i = 0; i < keys.length; i++) {
                const key = keys [i];
                this._encode(key);
                this._encode(value [key]);
            }
        } else {
            throw new Error(`Unsupported value type ${typeof value}`);
        }
    }

    encode(value) {
        this.index = 0;
        this._encode(value);
        this._flush();
    }

}

function cborEncode(value) {
    const encoder = new CborEncoder();

    const chunks = [];
    encoder.on('data', chunk => {
        chunks.push(chunk);
    });

    encoder.encode(value);

    return Buffer.concat(chunks);
}

module.exports = {
    CborEncoder,
    cborEncode,
};
