import * as fs from 'fs';
import * as ts from 'typescript';

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
