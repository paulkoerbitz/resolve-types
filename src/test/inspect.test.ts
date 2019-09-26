import { inspect, inspectWithPreamble } from 'index';

describe('inspect', () => {
    describe('inspectObjectCore', () => {
        test('Basic types', () => {
            const types = inspect({
                str: 'string',
                anys: 'any[]',
                record: 'Record<number, string>',
                fn: '(x: boolean) => number',
                id: '<T>(x: T) => T',
            });
            expect(types).toMatchSnapshot();
        });
        test('Self-reference', () => {
            const types = inspect({
                a: 'string',
                b: 'a | Promise<a>',
            });
            expect(types).toMatchSnapshot();
        });
        test('Preamble', () => {
            const types = inspectWithPreamble("let x = 1; let y = '';")({
                res: 'typeof x | typeof y',
            });
            expect(types).toMatchSnapshot();
        });
        test('Import', () => {
            const types = inspectWithPreamble(
                "import { inspect } from 'index';"
            )({
                res: 'typeof inspect',
            });
            expect(types).toMatchSnapshot();
        });
        test('Bad import', () => {
            expect(() =>
                inspectWithPreamble("import { foo } from 'blah';")({
                    res: 'typeof foo',
                })
            ).toThrow();
        });
    });
    describe('inspect', () => {
        test('runs', () => {
            expect(inspect('number')).toBe('number');
        });
    });
    describe('inspectObject', () => {
        test('runs', () => {
            expect(inspect({ x: 'number' })).toMatchObject({
                x: 'number',
            });
        });
    });
    describe('inspectWithPreamble', () => {
        test('runs', () => {
            expect(
                inspectWithPreamble('const x = Math.random()')('typeof x')
            ).toBe('number');
        });
    });
    describe('inspectObjectWithPreamble', () => {
        test('runs', () => {
            expect(
                inspectWithPreamble('const x = Math.random()')({
                    x: 'typeof x',
                })
            ).toMatchObject({ x: 'number' });
        });
    });
});
