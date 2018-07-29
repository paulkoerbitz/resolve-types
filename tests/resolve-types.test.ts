import 'jest';
import * as util from 'util';
import { resolveTypes } from '../src';

describe('resolveTypes', () => {
    it('returns assigned types to the right names', () => {
        const {
            types: { __1, __2, __3 },
        } = resolveTypes`
            type __1 = string;
            type __2 = number;
            type __3 = never;
        `;
        expect(__1).toEqual('string');
        expect(__2).toEqual('number');
        expect(__3).toEqual('never');
    });

    it('works with expressions in literals', () => {
        const {
            types: { __1, __foo, __3 },
        } = resolveTypes`
            type ${1} = string;
            type ${'foo'} = number;
            type ${3} = never;
        `;
        expect(__1).toEqual('string');
        expect(__foo).toEqual('number');
        expect(__3).toEqual('never');
    });

    it('works with a simple string', () => {
        const {
            types: { __1, __2, __3 },
        } = resolveTypes(
            '\
            type __1 = string;\
            type __2 = number;\
            type __3 = never;\
        '
        );
        expect(__1).toEqual('string');
        expect(__2).toEqual('number');
        expect(__3).toEqual('never');
    });

    it('works with object types', () => {
        const {
            types: { __0, __1 },
        } = resolveTypes`
            type ${0} = Pick<{ a: number; b: string; c: any; }, "a" | "b">;
            type ${1} = Pick<${0}, "a">;
        `;
        expect(__0).toEqual('{ a: number; b: string; }');
        expect(__1).toEqual('{ a: number; }');
    });

    it('works with array types', () => {
        const {
            types: { __0 },
        } = resolveTypes`
            type ${0} = [number, string, any][0 | 1];
        `;
        expect(__0).toEqual('string | number');
    });

    it('returns error diagnostis when something goes wrong', () => {
        const { diagnostics } = resolveTypes`
            import * as foo from 'i-dont-exist';
        `;
        expect(diagnostics[0].messageText).toEqual(
            "Cannot find module 'i-dont-exist'."
        );
        expect(diagnostics[0].code).toEqual(2307);
    });
});
