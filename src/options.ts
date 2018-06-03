import * as fs from 'fs';
import * as ts from 'typescript';

let options: ts.CompilerOptions;

export const setOptions = (input: ts.CompilerOptions, ignoreProjectOptions = false): void => {
    if (ignoreProjectOptions) {
        options = input;
        return;
    }
    const maybeFile = ts.findConfigFile(__dirname, fs.existsSync);
    if (maybeFile == undefined) {
        throw new Error("setOptions: Cannot find tsconfig.json");
    }
    const { config, error } = ts.readConfigFile(maybeFile, path => fs.readFileSync(path).toString());
    if (error != undefined) {
        const message = `TS${error.code}: ${error.file}:${error.start} ${error.messageText}`;
        throw new Error(message);
    }
    options = { ...config, ...input };
};

export const getOptions = (): ts.CompilerOptions => {
    if (options == undefined) {
        setOptions({});
    }
    return options;
};
