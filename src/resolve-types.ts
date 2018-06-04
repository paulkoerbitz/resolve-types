import * as ts from 'typescript';
import { FILENAME, FILENAME_RE, TYPENAME_RE } from './constants';
import { getOptions } from './options';

/**
 * Resolve type declarations in inline code.
 *
 * resolveTypes can be invoked with a string or template literal.
 * The types which should be resolved must be prefixed with two
 * underscores (e.g. __myType). When invoked with a template
 * literal interpolated entries will automatically be prefixed
 * with two underscores.
 *
 * Returns a map from declared type names to the string representation
 * of the type they evaluate to.
 *
 * Examples:
 *
 * resolveTypes("type __1 = string;") returns { __1: "string" }
 *
 * resolveTypes`
 *    type ${0} = number;
 *    type ${1} = string;
 * `
 * returns { __0: "number", __1: "string" }
 *
 * resolveTypes`
 *    type ${0} = Pick<{ a: number; b: string; c: any }, "a" | "b">;
 * `
 * returns { __0: "{ a: number; b: string; }" }
 */
export const resolveTypes = (
    input: string | TemplateStringsArray,
    ...args: any[]
) => {
    const result: { [key: string]: string } = {};

    const code = createInlineCode(input, args);
    const { program, inlineSourceFile } = createInlineProgram(code);

    const isTypeNameRegexp = new RegExp(extractTypeNames(code).join('|'));
    const checker = program.getTypeChecker();

    // Find our special type names, get their types, print them and put them
    // into the result object
    checker
        .getSymbolsInScope(
            inlineSourceFile!.endOfFileToken,
            ts.SymbolFlags.Type
        )
        .filter(symbol => isTypeNameRegexp.test(symbol.name))
        .map(symbol => ({
            type: checker.getDeclaredTypeOfSymbol(symbol),
            name: symbol.name
        }))
        .forEach(({ type, name }) => {
            result[name] = checker.typeToString(
                type,
                inlineSourceFile,
                // We need this TypeFormatFlags to avoid getting
                // the type alias we created back
                ts.TypeFormatFlags.InTypeAlias
            );
        });

    return result;
};

/**
 * Convert a template literal to appropriately formatted
 * inline code or use the inline code directly
 */
const createInlineCode = (s: TemplateStringsArray | string, args: any[]) => {
    if (typeof s === 'string') {
        return s;
    }
    let input: string[] = [];
    for (let i = 0; i < s.length; ++i) {
        if (i > 0) {
            input.push(`__${args[i - 1]}`);
        }
        input.push(s[i]);
    }
    return input.join('');
};

/**
 * Extract the type names from the inline code
 * e.g. for `type __1 = string;` return ['__1'];
 *
 * @param code The inline source code
 * @returns an array of type names
 */
const extractTypeNames = (code: string) => {
    let names: string[] = [];
    let match: RegExpExecArray | null = null;
    while ((match = TYPENAME_RE.exec(code))) {
        names.push(match[1]);
    }
    return names;
};

/**
 * Use the inline code to create a TypeScript program
 * To do so, we provide a fake file name and a custom
 * compile host which returns the inline code as source
 * file
 *
 * @param code The inline code we want to turn into a program
 */
const createInlineProgram = (code: string) => {
    // Work around definite assignemt checking: inlineSourceFile is assigned
    // when ts.createProgram is created
    let inlineSourceFile!: ts.SourceFile;
    const getSourceFile = (
        fileName: string,
        languageVersion: ts.ScriptTarget,
        ...args: any[]
    ) => {
        if (!FILENAME_RE.test(fileName)) {
            return (compilerHost.getSourceFile as any)(
                fileName,
                languageVersion,
                ...args
            );
        }
        if (inlineSourceFile == undefined) {
            inlineSourceFile = ts.createSourceFile(
                FILENAME,
                code,
                languageVersion
            );
        }
        return inlineSourceFile;
    };
    const options = getOptions();
    const compilerHost = ts.createCompilerHost(options);
    const customCompilerHost = {
        ...compilerHost,
        getSourceFile
    };
    const program = ts.createProgram([FILENAME], options, customCompilerHost);
    return { program, inlineSourceFile };
};
