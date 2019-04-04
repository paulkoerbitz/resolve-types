import * as fs from 'fs';
import * as ts from 'typescript';

export const FILENAME = '__ts-type-test-inline-e1d70ff1__';
export const FILENAME_RE = new RegExp(FILENAME);
export const TYPENAME_RE = /type\s+(__[a-zA-Z0-9][_a-zA-Z0-9]*)[^_a-zA-Z0-9]+/g;

/**
 * The global options object which setOptions and getOptions work on
 */
let options: ts.CompilerOptions;

/**
 * Set compiler options for checking inline code
 *
 * These options set a global options object which any subsequent
 * invocations of `resolveTypes` will use.
 *
 * ignoreProjectOptions controls if the options from tsconfig are
 * used or not.
 *
 * @param input Compiler options for use when checking inline code.
 * @param ignoreProjectOptions If true, do not merge the passed options with
 *     the project options (from tsconfig.json) but only use the passed options
 *     exclusively. False by default.
 */
export const setOptions = (
    input: ts.CompilerOptions,
    ignoreProjectOptions = false
): void => {
    if (ignoreProjectOptions) {
        options = input;
        return;
    }
    const maybeFile = ts.findConfigFile(__dirname, fs.existsSync);
    if (maybeFile === undefined) {
        throw new Error('setOptions: Cannot find tsconfig.json');
    }
    const { config, error } = ts.readConfigFile(maybeFile, path =>
        fs.readFileSync(path).toString()
    );
    if (error !== undefined) {
        const message = `TS${error.code}: ${error.file}:${error.start} ${
            error.messageText
        }`;
        throw new Error(message);
    }
    options = { ...config, ...input };
};

/**
 * Get the TypeScript compiler options to be used for resolving types
 */
export const getOptions = (): ts.CompilerOptions => {
    if (options === undefined) {
        setOptions({});
    }
    return options;
};

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
        if (inlineSourceFile === undefined) {
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

export const resolveTypes = (
    code: string,
    whitelist: string[],
    // types?: Record<string, string>
) => {
    const { program, inlineSourceFile } = createInlineProgram(code);
    const checker = program.getTypeChecker();

    checker
        .getSymbolsInScope(
            inlineSourceFile!.endOfFileToken,
            ts.SymbolFlags.Type
        )
        .filter(symbol => whitelist.includes(symbol.name))
        .forEach(symbol => {
            let typeAsString: string; // cache value once computed
            const type = checker.getDeclaredTypeOfSymbol(symbol);
            typeAsString = checker.typeToString(
                type,
                inlineSourceFile,
                ts.TypeFormatFlags.InTypeAlias
            );
            console.log(typeAsString);
            return typeAsString;
        });

    let diagnostics: ReadonlyArray<ts.Diagnostic>;

    return {
        types: {},
        get diagnostics() {
            if (diagnostics === undefined) {
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

const p = resolveTypes("type x = Pick<{a: string, b: number}, 'b'>", ['x']);
console.log(p);
