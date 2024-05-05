function hex2Buffer(input) {
    const expandedInput = input.replaceAll(/ (\S\S) \.\.\. (\S\S) /g, (match, p1, p2) => {
        const start = Number.parseInt(p1, 16);
        const end = Number.parseInt(p2, 16);
        const parts = [];
        for (let value = start; value <= end; value++) {
            parts.push(value.toString(16).padStart(2, '0'));
        }
        return parts.join(' ');
    });

    return Buffer.from(expandedInput.replaceAll(/\s/g, ''), 'hex');
}

const cobsTestData1Raw = hex2Buffer('00');
const cobsTestData1Enc = hex2Buffer('01 01 00');

const cobsTestData2Raw = hex2Buffer('00 00');
const cobsTestData2Enc = hex2Buffer('01 01 01 00');

const cobsTestData3Raw = hex2Buffer('00 11 00');
const cobsTestData3Enc = hex2Buffer('01 02 11 01 00');

const cobsTestData4Raw = hex2Buffer('11 22 00 33');
const cobsTestData4Enc = hex2Buffer('03 11 22 02 33 00');

const cobsTestData5Raw = hex2Buffer('11 22 33 44');
const cobsTestData5Enc = hex2Buffer('05 11 22 33 44 00');

const cobsTestData6Raw = hex2Buffer('11 00 00 00');
const cobsTestData6Enc = hex2Buffer('02 11 01 01 01 00');

const cobsTestData7Raw = hex2Buffer('01 02 03 ... FD FE');
const cobsTestData7Enc = hex2Buffer('FF 01 02 03 ... FD FE 00');

const cobsTestData8Raw = hex2Buffer('00 01 02 ... FC FD FE');
const cobsTestData8Enc = hex2Buffer('01 FF 01 02 ... FC FD FE 00');

const cobsTestData9Raw = hex2Buffer('01 02 03 ... FD FE FF');
const cobsTestData9Enc = hex2Buffer('FF 01 02 03 ... FD FE 02 FF 00');

const cobsTestData10Raw = hex2Buffer('02 03 04 ... FE FF 00');
const cobsTestData10Enc = hex2Buffer('FF 02 03 04 ... FE FF 01 01 00');

const cobsTestData11Raw = hex2Buffer('03 04 05 ... FF 00 01');
const cobsTestData11Enc = hex2Buffer('FE 03 04 05 ... FF 02 01 00');

module.exports = {
    cobsTestData1Raw,
    cobsTestData1Enc,
    cobsTestData2Raw,
    cobsTestData2Enc,
    cobsTestData3Raw,
    cobsTestData3Enc,
    cobsTestData4Raw,
    cobsTestData4Enc,
    cobsTestData5Raw,
    cobsTestData5Enc,
    cobsTestData6Raw,
    cobsTestData6Enc,
    cobsTestData7Raw,
    cobsTestData7Enc,
    cobsTestData8Raw,
    cobsTestData8Enc,
    cobsTestData9Raw,
    cobsTestData9Enc,
    cobsTestData10Raw,
    cobsTestData10Enc,
    cobsTestData11Raw,
    cobsTestData11Enc,
};
