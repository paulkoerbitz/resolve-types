import ts from 'typescript';
import { FILENAME, FILENAME_RE, TYPENAME_RE } from './constants';

/**
 * TODOS:
 * - [x] generalize parameter names & positions
 * - [x] handle non-intrinsic types correctly
 * - [ ] correctly extract compilation options
 * - [ ] comment this code
 * - [ ] make npm library out of this
 * - [ ] allow injecting options
 */

export const resolveTypes = (code: string, options?: ts.CompilerOptions) => {
    const result: { [key: string]: string } = {};
    const finalOptions = resolveOptions(options);
    const compilerHost = ts.createCompilerHost(finalOptions);
    let inlineCode: ts.SourceFile;
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
        if (inlineCode == undefined) {
            inlineCode = ts.createSourceFile(FILENAME, code, languageVersion);
        }
        return inlineCode;
    };
    const customCompilerHost = {
        ...compilerHost,
        getSourceFile
    };
    const program = ts.createProgram(
        [FILENAME],
        finalOptions,
        customCompilerHost
    );

    const isTypeNameRegexp = new RegExp(extractTypeNames(code).join('|'));
    const checker = program.getTypeChecker();
    checker
        .getSymbolsInScope(inlineCode!.endOfFileToken, ts.SymbolFlags.Type)
        .filter(symbol => isTypeNameRegexp.test(symbol.name))
        .map(symbol => ({
            type: checker.getDeclaredTypeOfSymbol(symbol),
            name: symbol.name
        }))
        .forEach(({ type, name }) => {
            result[name] = checker.typeToString(
                type,
                inlineCode,
                ts.TypeFormatFlags.InTypeAlias
            );
        });
    return result;
};

export const resolveTypesOnTemplate = (
    s: TemplateStringsArray,
    ...args: any[]
) => {
    let input: string[] = [];
    for (let i = 0; i < s.length; ++i) {
        if (i > 0) {
            input.push(`__${args[i - 1]}`);
        }
        input.push(s[i]);
    }
    return resolveTypes(input.join(''));
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

// FIXME: load projects compiler options if none given
const resolveOptions = (options?: ts.CompilerOptions): ts.CompilerOptions =>
    options || {};
