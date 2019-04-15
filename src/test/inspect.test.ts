import {
    inspect,
    inspectObject,
    inspectObjectWithPreamble,
    inspectWithPreamble,
} from 'index';
import { inspectObjectCore } from 'lib/inspect';

describe('inspect', () => {
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
    describe('inspect', () => {
        test('runs', () => {
            expect(inspect('number')).toBe('number');
        });
    });
    describe('inspectObject', () => {
        test('runs', () => {
            expect(inspectObject({ x: 'number' })).toMatchObject({
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
                inspectObjectWithPreamble('const x = Math.random()')({
                    x: 'typeof x',
                })
            ).toMatchObject({ x: 'number' });
        });
    });
});
