import { inspect } from 'index';

describe('Inspect', () => {
    test('Basic types', () => {
        const types = inspect('', {
            str: 'string',
            anys: 'any[]',
            record: 'Record<number, string>',
            fn: '(x: boolean) => number',
            id: '<T>(x: T) => T',
        });
        expect(types).toMatchSnapshot();
    });
    test('Self-reference', () => {
        const types = inspect('', {
            a: 'string',
            b: 'a | Promise<a>',
        });
        expect(types).toMatchSnapshot();
    });
    test('Preamble', () => {
        const types = inspect(`let x = 1; let y = '';`, {
            res: 'typeof x & typeof y',
        });
        expect(types).toMatchSnapshot();
    });
    test('Import', () => {
        const types = inspect(`import { inspect } from 'index';`, {
            res: 'typeof inspect',
        });
        expect(types).toMatchSnapshot();
    });
});
