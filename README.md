# resolve-types

`resolve-types` allows you to resolve types in inline code. This functionality is handy to write unit tests for type operators and check them in a regular test suite.

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
        const { __1 } = resolveTypes(code);
        expect(__1).to.equal("{ a: number; b: string; }");
    });

    it("resolveTypes also works with template literals", () => {
        const { __2 } = resolveTypes`
            type ${1} = Pick<{ a: number; b: string; c: any; }, 'a' | 'b'>;
            type ${2} = Pick<${1}, 'a'>;
        `;
        expect(__2).to.equal("{ a: number; }");
    });
});
```

## Documentation

The `resolve-types` library exposes two functions: `resolveTypes` which does
the actual work and `setOptions` which allows setting options for the TypeScript
compilation.

### `resolveTypes`

`resolveTypes` takes either a string or a template literal, creates a TypeScript program out of it and extracts the types of specially named type declaration and returns these as strings in a JavaScript object. Type type declarations must have the form `type __[a-zA-Z0-9][_a-zA-Z0-9]*`. In template literals, any expressions which are resolved are automatically prefixed with `__` to fulfill the naming requirement.

`resolveTypes` ignores any compilation errors, but may return `"<unknown>"` for any types it cannot resolve.

### `setOptions`

`setOptions` allows setting TypeScript compiler options before compiling the
program with `resolveTypes`. By default, the options from the project's `tsconfig.json` will be used. To override this, set `setOptions` second parameter to true.

`setOptions` sets a global options variable, so its use is stateful and will
be maintained across invocations of `resolveTypes`.

## Contributing

Contributions in the form of bug reports, change requests, documentation and code changes are welcome. Please make sure there is an outstanding ticket which has been discussed before making large code changes.

## License

MIT

## TODOS

- [x] generalize parameter names & positions
- [x] handle non-intrinsic types correctly
- [x] correctly extract compilation options
- [x] allow injecting options
- [x] comment this code
- [x] write readme
- [x] tests
- [x] Automate prettification, test running, etc
- [ ] make npm library out of this
- [ ] blog post
- [ ] return possible compilation errors from resolveTypes


