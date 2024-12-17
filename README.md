# `cobs-crc16-cbor-utils`

A JavaScript library for exchanging structured data with small embedded devices using COBS, CRC-16 and a CBOR subset.


## Features

- Implements encoders and decoders for the "Consistent Overhead Byte Stuffing (COBS)"
    - See [Wikipedia article](https://en.wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing) for details
- Implements a CRC-16-CCITT calculation, encoders and decoders
    - See [Wikipedia article](https://en.wikipedia.org/wiki/Cyclic_redundancy_check) for details
- Implements encoders and decoders for a subset of the "Concise Binary Object Representation (CBOR)" specification
    - See [Specification](https://www.rfc-editor.org/rfc/rfc8949) for details
- Implements combining encoders and decoders
    - COBS <--> CBOR
    - COBS <--> CRC-16
    - COBS <--> CRC-16 <--> CBOR
- Zero production dependencies
- High test coverage


## Known issues

- Lack of documentation
- CBOR implementation does not support
    - Integers larger than 32-bit
    - Floating point numbers
    - Tags


## Installation

```
yarn add cobs-crc16-cbor-utils
```


## Usage

### Byte stream encoders

The library exports two byte stream encoder classes:

- `CobsEncoder`: packetizes a byte stream using COBS
- `CobsCrc16Encoder`: appends a CRC16 to a byte stream and packetizes that using COBS

Both are `EventEmitter`s  and emit `data` events whenever they have encoded a chunk of bytes. The data gets fed in using the `encodeData` method, which can be called multiple times to incrementally deliver the byte stream to encode. Once a byte stream has reached its end, the `encodeDelimiter` method must be called to flush buffered data and reset the encoder/decoder for a new byte stream.


### Value encoders

The library exports three value encoder classes:

- `CborEncoder`: encoded a value into its CBOR byte stream representation
- `CobsCborEncoder`: encodes a value into its CBOR byte stream representation and packetizes it using COBS (by feeding it through a `CobsEncoder`)
- `CobsCrc16CborEncoder`: encodes a value into is CBOR byte stream representation, appends a CRC16 and packetizes that using COBS (by feeding it through a `CobsCrc16Encoder`)

They also are `EventEmitter`s and emit `data` events whenever they have encoded a chunk of bytes.


### Byte stream decoders

The library exports two byte stream decoder classes:

- `CobsDecoder`: decodes a COBS byte stream into packets
- `CobsCrc16Decoder`: decodes a COBS byte stream into packets, checking the appended CRC16

Both are `EventEmitter`s and emit `packet` events whenever a packet was successfully decoded (and optionally its CRC was correct).


### Value decoders

The library exports two value decoder classes:

- `CobsCborDecoder`: decodes a CBOR value from a COBS packet
- `CobsCrc16CborDecoder`: decodes a CBOR value from a COBS packet that included a CRC16 at the end

Both are `EventEmitter`s and emit `packet` events whenever a value was sucessfully decoded.


## Changelog

### `0.2.0`

- Add support for 32-bit floating point numbers.
- Add initial support for CRC-32


### `0.1.0`

- Initial release


## License

```
The MIT License (MIT)

Copyright (c) 2024-present, Daniel Wippermann.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
