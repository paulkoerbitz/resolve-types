# resolve-types

[![npm version](https://img.shields.io/npm/v/resolve-types.svg?style=flat-square)](https://www.npmjs.com/package/resolve-types)

`resolve-types` allows you to resolve types in inline code. This functionality is handy to write unit tests for type operators and check them in a regular test suite.

## Compatibility Note

The shape of the return type of `resolveTypes` changed in version 0.2.0 to return
diagnostic errors. It now returns a value of shape `{ diagnostics, types }` whereas
it returned the content of `types` directly in versions `0.1.*`.

## Example

`resolve-types` can be used as follows to test type operators:

```TypeScript
import "jest"; // example test runner
import { resolveTypes } from "resolve-types";

describe("Type Operators Example", () => {
    it("Pick extracts keys from objects", () => {
        const code = "\
            type __1 = Pick<{ a: number; b: string; c: any; }, 'a' | 'b'>;\
        ";
        const { types: { __1 } } = resolveTypes(code);
        expect(__1).to.equal("{ a: number; b: string; }");
    });

    it("resolveTypes also works with template literals", () => {
        const { types: { __2 } } = resolveTypes`
            type ${1} = Pick<{ a: number; b: string; c: any; }, 'a' | 'b'>;
            type ${2} = Pick<${1}, 'a'>;
        `;
        expect(__2).to.equal("{ a: number; }");
    });

    it("resolveTypes returns diagnostic messages in the 'diagnostics' property ", () => {
        const { diagnostics, types } = resolveTypes`
            import * as foo from 'i-dont-exist';
        `;
        expect(diagnostics[0].code).toEqual(2307);
        expect(diagnostics[0].messageText).toEqual("Cannot find module 'i-dont-exist'.");
    });
});
```

## Documentation

The `resolve-types` library exposes two functions: `resolveTypes` which does
the actual work and `setOptions` which allows setting options for the TypeScript
compilation.

### `resolveTypes`

`resolveTypes` takes either a string or a template literal, creates a TypeScript program out of it and extracts the types of specially named type declarations and returns compliation diagnostics and the resolved types. Type type declarations must have the form `type __[a-zA-Z0-9][_a-zA-Z0-9]*`. In template literals, any expressions which are resolved are automatically prefixed with `__` to fulfill the naming requirement.

The return value of `resolveTypes` has the shape
```TypeScript
{
    types: { [key: string]: string; };
    diagnostics: ts.Diagnostic[];
}
```
where `ts.Diagnostic` is the type of Diagnostics from the TypeScript compiler. Both
types and diagnostics are computed lazily to minimize the performance impact of objects
which are never read.

`resolveTypes` may return `"<unknown>"` for any types it cannot resolve. This happens especially
for compilation errors, check the `diagnostics` property for these.

### `setOptions`

`setOptions` allows setting TypeScript compiler options before compiling the
program with `resolveTypes`. By default, the options from the project's `tsconfig.json` will be used. To override this, set `setOptions` second parameter to true.

`setOptions` sets a global options variable, so its use is stateful and will
be maintained across invocations of `resolveTypes`.

## Contributing

Contributions in the form of bug reports, change requests, documentation and code changes are welcome. Please make sure there is an outstanding ticket which has been discussed before making large code changes.

## License

MIT