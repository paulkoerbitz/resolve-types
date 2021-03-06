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
    const types: { readonly [key: string]: string } = {};

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
        .forEach(symbol => {
            // Lazily compute the type of each desired symbol by
            // defining it as a get-able property. This ensures
            // we only compute the types we actually need
            const name = symbol.name;
            let typeAsString: string; // cache value once computed
            Object.defineProperty(types, name, {
                get: () => {
                    if (typeAsString == undefined) {
                        const type = checker.getDeclaredTypeOfSymbol(symbol);
                        typeAsString = checker.typeToString(
                            type,
                            inlineSourceFile,
                            // We need this TypeFormatFlags to avoid getting
                            // the type alias we created back
                            ts.TypeFormatFlags.InTypeAlias
                        );
                    }
                    return typeAsString;
                },
            });
        });

    let diagnostics: ReadonlyArray<ts.Diagnostic>;

    return {
        types,
        get diagnostics() {
            if (diagnostics == undefined) {
                diagnostics = [
                    ...program.getSyntacticDiagnostics(inlineSourceFile),
                    ...program.getSemanticDiagnostics(inlineSourceFile),
                    ...program.getDeclarationDiagnostics(inlineSourceFile),
                ];
            }
            return diagnostics;
        },
    };
};

/**
 * Convert a template literal to appropriately formatted
 * inline code or use the inline code directly
 */
const createInlineCode = (s: TemplateStringsArray | string, args: any[]) => {
    if (typeof s === 'string') {
        return s;
    }
    const input: string[] = [];
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
 * e.g. for `type __1 = string;` return `['__1']`;
 *
 * @param code The inline source code
 * @returns an array of type names
 */
const extractTypeNames = (code: string) => {
    const names: string[] = [];
    let match: RegExpExecArray | null = TYPENAME_RE.exec(code);
    while (match != null) {
        names.push(match[1]);
        match = TYPENAME_RE.exec(code);
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
        getSourceFile,
    };
    const program = ts.createProgram([FILENAME], options, customCompilerHost);
    return { program, inlineSourceFile };
};
