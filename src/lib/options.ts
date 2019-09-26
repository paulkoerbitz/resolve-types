import * as fs from 'fs';
import * as ts from 'typescript';

/** @ignore */
let options: ts.CompilerOptions;

/**
 * @see https://github.com/Microsoft/TypeScript/issues/5276#issuecomment-148926002
 * @ignore
 */
function convertConfigToCompilerOptions(opts: {
    compilerOptions: ts.CompilerOptions;
}) {
    const { options, errors } = ts.parseJsonConfigFileContent(
        {
            ...opts,
            // if files are not specified then parseJsonConfigFileContent
            // will use ParseConfigHost to collect files in containing folder
            files: [],
        },
        ts.sys,
        ''
    );
    // Remove the following error:
    // { messageText: "The 'files' list in config file 'tsconfig.json' is empty.", category: 1, code: 18002 }
    const relevantErrors = errors.filter(e => e.code !== 18002);
    if (relevantErrors.length > 0) {
        throw relevantErrors;
    }

    return options;
}

/**
 * Set compiler options for inspect functions.
 * Operates on global object.
 *
 * @param input Compiler options. Beware, enum option values are different than the ones from your json.
 * @param ignoreProjectOptions If true, do not merge the passed options with the project options (from tsconfig.json) but only use the passed options exclusively. False by default.
 * @returns current options
 */
export const setOptions = (
    input: ts.CompilerOptions,
    ignoreProjectOptions = false
) => {
    if (ignoreProjectOptions) {
        options = input;
        return options;
    }
    const maybeFile = ts.findConfigFile(__dirname, fs.existsSync);
    if (maybeFile === undefined) {
        throw new Error('setOptions: Cannot find tsconfig.json');
    }
    const { config, error } = ts.readConfigFile(maybeFile, path =>
        fs.readFileSync(path).toString()
    );
    const parsedConfig = convertConfigToCompilerOptions(config);
    if (error !== undefined) {
        const message = `TS${error.code}: ${error.file}:${error.start} ${error.messageText}`;
        throw new Error(message);
    }
    options = { ...parsedConfig, ...input };
    return options;
};

/**
 * Get the TypeScript compiler options to be used for inspect functions.
 */
export const getOptions = (): ts.CompilerOptions => {
    if (options === undefined) {
        setOptions({});
    }
    return options;
};
