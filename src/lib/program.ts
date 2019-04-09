import * as ts from 'typescript';
import { getOptions } from './options';

export const FILENAME = '__ts-type-test-inline-e1d70ff1__';
export const FILENAME_RE = new RegExp(FILENAME);
export const TYPENAME_RE = /type\s+(__[a-zA-Z0-9][_a-zA-Z0-9]*)[^_a-zA-Z0-9]+/g;

export const createInlineProgram = (code: string) => {
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