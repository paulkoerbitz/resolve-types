import { inspectObject } from 'index';

describe('InspectObject', () => {
    test('Basic types', () => {
        const types = inspectObject('', {
            str: 'string',
            anys: 'any[]',
            record: 'Record<number, string>',
            fn: '(x: boolean) => number',
            id: '<T>(x: T) => T',
        });
        expect(types).toMatchSnapshot();
    });
    test('Self-reference', () => {
        const types = inspectObject('', {
            a: 'string',
            b: 'a | Promise<a>',
        });
        expect(types).toMatchSnapshot();
    });
    test('Preamble', () => {
        const types = inspectObject("let x = 1; let y = '';", {
            res: 'typeof x & typeof y',
        });
        expect(types).toMatchSnapshot();
    });
    test('Import', () => {
        const types = inspectObject("import { inspectObject } from 'index';", {
            res: 'typeof inspectObject',
        });
        expect(types).toMatchSnapshot();
    });
    test('Bad import', () => {
        expect(() =>
            inspectObject("import { foo } from 'blah';", {
                res: 'typeof foo',
            })
        ).toThrow();
    });
});
