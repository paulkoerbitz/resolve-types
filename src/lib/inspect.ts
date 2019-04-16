import * as ts from 'typescript';
import { createInlineProgram } from './program';

/** @ignore */
export const inspectObjectCore = <T extends Record<string, string>>(
    preamble: string,
    typeMap: T
) => {
    const code = [`${preamble};`]
        .concat(Object.entries(typeMap).map(([k, d]) => `type ${k} = ${d};`))
        .join(' ');
    const { program, inlineSourceFile } = createInlineProgram(code);
    const checker = program.getTypeChecker();

    const pairs = checker
        .getSymbolsInScope(
            inlineSourceFile!.endOfFileToken,
            ts.SymbolFlags.Type
        )
        .filter(symbol => Object.keys(typeMap).includes(symbol.name))
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
        {} as { [K in keyof T]: string }
    );

    const diagnostics = [
        ...program.getSyntacticDiagnostics(inlineSourceFile),
        ...program.getSemanticDiagnostics(inlineSourceFile),
        ...program.getDeclarationDiagnostics(inlineSourceFile),
    ];

    if (diagnostics.length > 0) {
        console.log(diagnostics);
        throw diagnostics;
    }

    return types;
};

/** @ignore */
export const inspectCore = (preamble: string, type: string) =>
    inspectObjectCore(preamble, { x: type }).x;

/**
 * Same as `inspectObject`, but with additional step of adding a code before the type resolution.
 *
 * @see [[inspectObject]]
 * @example
 * ```typescript
 * const inspectWithFoo = inspectObjectWithPreamble('const foo = 2');
 * inspectWithFoo({foo: 'typeof foo'}); // { foo: "2" }
 * ```
 * @param preamble TypeScript code to be prepended
 * @returns `Record<string, string> -> Record<string, string>` an `inspectObject` function with prepended code
 */
export const inspectObjectWithPreamble = <T extends Record<string, string>>(
    preamble: string
) => (typeMap: T) => inspectObjectCore(preamble, typeMap);

/**
 * Same as `inspect`, but with additional step of adding a code before the type resolution.
 *
 * @see [[inspect]]
 * @example
 * ```typescript
 * const inspectWithFoo = inspectWithPreamble('const foo = 2');
 * inspectWithFoo('typeof foo'); // "2"
 * ```
 * @param preamble TypeScript code to be prepended
 * @returns `string -> string` an `inspect` function with prepended code
 */
export const inspectWithPreamble = (preamble: string) => (type: string) =>
    inspectCore(preamble, type);

/**
 * Same as `inspect`, but accepts an object of types.
 *
 * @see [[inspect]]
 * @example
 * ```typescript
 * inspectObject({a: 'string | number', b: 'boolean'}); // {a: "string | number", b: "boolean"}
 * ```
 * @function `Record<string, string> -> Record<string, string>`
 * @param typeMap Object with values of TypeScript type expression
 * @returns Object of resolved TypeScript types
 */
export const inspectObject = inspectObjectWithPreamble('');

/**
 * Returns type as a string from TS expression.
 * Creates an inline TS snippet and parses type from the provided input.
 *
 * @example
 * ```typescript
 * inspect('Record<keyof any, Array<number>>'); // "{ [x: string]: number[]; [x: number]: number[]; };"
 * ```
 * @function `string -> string`
 * @param type TypeScript type expression, e.g. `typeof Math.random()`
 * @returns TypeScript type, e.g. `number`
 */
export const inspect = inspectWithPreamble('');

const myInspect = inspectObjectWithPreamble(`
const ans = () => 42;
const ran = 'foo'.toUpperCase();
type Complex = { r: number; i: number };`);
const res = myInspect({
    fooRes: 'ReturnType<typeof ans>',
    typeOfRan: 'typeof ran',
    real: "Pick<Complex, 'r'>",
});

console.log(res);
