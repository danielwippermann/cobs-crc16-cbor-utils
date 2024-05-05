const { describe, it, expect } = require('@jest/globals');

/**
 * @param {object} obj
 * @param {string[]} names
 * @param {string[]?} ignored
 */
function expectObjectOwnPropertyNamesToEqual(obj, names, ignored) {
    function filter(names) {
        if (ignored) {
            return names.filter(name => !ignored.includes(name));
        } else {
            return names.slice(0);
        }
    }

    const actual = filter(Object.getOwnPropertyNames(obj)).sort();
    const expected = filter(names).sort();
    expect(actual).toEqual(expected);
}

function expectToBeClass(Class, instanceProps, staticProps) {
    expect(Class).toEqual(expect.any(Function));
    expectObjectOwnPropertyNamesToEqual(Class.prototype, instanceProps);
    expectObjectOwnPropertyNamesToEqual(Class, staticProps ?? [], [
        'length',
        'name',
        'prototype',
    ]);
}

module.exports = {
    describe,
    it,
    expect,

    expectObjectOwnPropertyNamesToEqual,
    expectToBeClass,
};
