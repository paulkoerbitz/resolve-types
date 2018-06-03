import * as ts from 'typescript';
import { FILENAME, FILENAME_RE, TYPENAME_RE } from './constants';
import { getOptions } from './options';

export const resolveTypes = (input: string | TemplateStringsArray, ...args: any[]) => {
    const code = createInlineCode(input, args);
    const result: { [key: string]: string } = {};
    const options = getOptions();
    const compilerHost = ts.createCompilerHost(options);
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
        options,
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

const createInlineCode = (
    s: TemplateStringsArray | string,
    args: any[]
) => {
    if (typeof s === "string") {
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