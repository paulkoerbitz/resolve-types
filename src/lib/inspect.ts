import * as ts from 'typescript';
import { createInlineProgram } from './program';

/**
 * Same as `inspect`, but with additional step of adding a code before the type resolution.
 *
 * @see [[inspect]]
 *
 * @example
 * ```typescript
 * const inspectWithFoo = inspectWithPreamble('const foo = 2');
 * inspectWithFoo('typeof foo'); // "2"
 * ```
 * @example
 * ```typescript
 * const inspectWithFoo = inspectWithPreamble('const foo = 2');
 * inspectWithFoo({foo: 'typeof foo'}); // { foo: "2" }
 * ```
 * @param preamble TypeScript code to be prepended
 * @returns `Record<string, string> -> Record<string, string>` an `inspectObject` function with prepended code
 */
export const inspectWithPreamble = (preamble: string) => <
    T extends Record<string, string> | string
>(
    input: T
) => {
    const scalar = typeof input === 'string';
    if (scalar) {
        input = { x: input } as any;
    }
    const code = [`${preamble};`]
        .concat(Object.entries(input).map(([k, d]) => `type ${k} = ${d};`))
        .join(' ');
    const { program, inlineSourceFile } = createInlineProgram(code);
    const checker = program.getTypeChecker();

    const pairs = checker
        .getSymbolsInScope(
            inlineSourceFile!.endOfFileToken,
            ts.SymbolFlags.Type
        )
        .filter(symbol => Object.keys(input).includes(symbol.name))
        .map(symbol => {
            const symbolType = checker.getDeclaredTypeOfSymbol(symbol);
            const type = checker.typeToString(
                symbolType,
                inlineSourceFile,
                ts.TypeFormatFlags.InTypeAlias
            );
            return [symbol.name, type];
        });

    const types = pairs.reduce(
        (acc, [k, v]) => {
            acc[k] = v;
            return acc;
        },
        {} as any
    );

    const diagnostics = [
        ...program.getSyntacticDiagnostics(inlineSourceFile),
        ...program.getSemanticDiagnostics(inlineSourceFile),
        ...program.getDeclarationDiagnostics(inlineSourceFile),
    ];

    if (diagnostics.length > 0) {
        throw diagnostics;
    }

    return (scalar ? types.x : types) as T;
};

/**
 * Returns type as a string from TS expression.
 * Creates an inline TS snippet and parses type from the provided input.
 *
 * @example
 * ```typescript
 * inspect('Record<keyof any, Array<number>>'); // "{ [x: string]: number[]; [x: number]: number[]; };"
 * ```
 *
 * @example
 * ```typescript
 * inspect({a: 'string | number', b: 'boolean'}); // {a: "string | number", b: "boolean"}
 * ```
 * @function `string -> string`
 * @function `Record<string, string> -> Record<string, string>`
 * @param type TypeScript type expression, e.g. `typeof Math.random()`
 * @returns TypeScript type, e.g. `number`
 */
export const inspect = inspectWithPreamble('');
