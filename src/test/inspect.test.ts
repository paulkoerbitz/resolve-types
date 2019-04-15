import { inspectObjectCore } from 'lib/inspect';

describe('inspectObjectCore', () => {
    test('Basic types', () => {
        const types = inspectObjectCore('', {
            str: 'string',
            anys: 'any[]',
            record: 'Record<number, string>',
            fn: '(x: boolean) => number',
            id: '<T>(x: T) => T',
        });
        expect(types).toMatchSnapshot();
    });
    test('Self-reference', () => {
        const types = inspectObjectCore('', {
            a: 'string',
            b: 'a | Promise<a>',
        });
        expect(types).toMatchSnapshot();
    });
    test('Preamble', () => {
        const types = inspectObjectCore("let x = 1; let y = '';", {
            res: 'typeof x & typeof y',
        });
        expect(types).toMatchSnapshot();
    });
    test('Import', () => {
        const types = inspectObjectCore(
            "import { inspectObject } from 'index';",
            {
                res: 'typeof inspectObject',
            }
        );
        expect(types).toMatchSnapshot();
    });
    test('Bad import', () => {
        expect(() =>
            inspectObjectCore("import { foo } from 'blah';", {
                res: 'typeof foo',
            })
        ).toThrow();
    });
});
