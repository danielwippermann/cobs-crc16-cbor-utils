const { describe, it, expect } = require('@jest/globals');

const testUtilsModule = require('./test-utils');

describe('test-utils module:', () => {

    it('should export correctly', () => {
        expect(Object.getOwnPropertyNames(testUtilsModule).sort()).toEqual([
            'describe',
            'it',
            'expect',

            'expectObjectOwnPropertyNamesToEqual',
            'expectToBeClass',
        ].sort());
    });

    const {
        expectObjectOwnPropertyNamesToEqual,
        expectToBeClass,
    } = testUtilsModule;

    it('expectObjectOwnPropertyNamesToEqual() should work correctly', () => {
        const obj1 = {
            a1: 0,
            b1: 1,
            c1: undefined,
        };

        const obj2 = Object.create(obj1);

        obj2.a1 = 2;
        obj2.b2 = 3;
        obj2.c2 = undefined;

        expectObjectOwnPropertyNamesToEqual(obj2, [
            'a1',
            'b2',
            'c2',
        ]);

        expectObjectOwnPropertyNamesToEqual(obj2, [
            'b2',
            'c2',
        ], [
            'a1',
        ]);
    });

    it('expectToBeClass() should work correctly', () => {
        class ClassA {
            constructor() {
                this.a1 = 0;
            }

            funcA1() {}
        }

        ClassA.A1 = 0;

        class ClassB extends ClassA {
            constructor() {
                super();
                this.b1 = 0;
            }

            funcB1() {}
        }

        ClassB.B1 = 0;

        class ClassC extends ClassB {
        }

        expectToBeClass(ClassA, [
            'constructor',
            'funcA1',
        ], [
            'A1',
        ]);

        expectToBeClass(ClassB, [
            'constructor',
            'funcB1',
        ], [
            'B1',
        ]);

        expectToBeClass(ClassC, [
            'constructor',
        ]);

        expectToBeClass(ClassC, [
            'constructor',
        ], []);
    });

});
