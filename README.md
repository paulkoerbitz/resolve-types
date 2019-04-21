<div align="center">

<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/sleuth-or-spy_1f575.png" />

<h1>In<img src="https://cdn-images-1.medium.com/max/1600/1*mn6bOs7s6Qbao15PMNRyOA.png" width=30 />pector</h1>


[![Build Status](https://img.shields.io/travis/com/grissius/intspector/master.svg?style=flat-square)](https://travis-ci.com/grissius/intspector)
[![Npm](https://img.shields.io/npm/v/intspector.svg?style=flat-square)](https://www.npmjs.com/package/intspector)
[![Coverage](https://img.shields.io/codeclimate/coverage/grissius/intspector.svg?style=flat-square)](https://codeclimate.com/github/grissius/intspector)
[![Maintainability](https://img.shields.io/codeclimate/maintainability/grissius/intspector.svg?style=flat-square)](https://codeclimate.com/github/grissius/intspector)
[![Dependency Status](https://img.shields.io/david/grissius/intspector.svg?style=flat-square)](https://david-dm.org/grissius/intspector)
[![Dev Dependency Status](https://img.shields.io/david/dev/grissius/intspector.svg?style=flat-square)](https://david-dm.org/grissius/intspector?type=dev)
[![vump](https://raw.githubusercontent.com/grissius/vump/master/asset/badge.png)](https://github.com/grissius/vump)


Inspect your TS types as strings and integrate type testing into your favorite testing framework!

</div>


## Motivation

When you find yourself writing a library with complex typings, you might find the urge to test your meta types, return types of your function etc.

The usual approach is an assignment to a typed variable, which is a good start. But (1) it is not a test for an exact type match, but for one-way type bound in type hierarchy due to inheritance, and (2) your unit test now either passes or does not compile (in case you break the typings), which is not exactly a way to go, sir.

When you are really into it, you set up [`dtslint`](https://github.com/Microsoft/dtslint). There are lot of disadvantages from my point of view. See _See also_ section lower. But if you take it seriously, the main disadvantage is that you have to spell out all the type annotations by yourself. Which means you cannot take advantage of Jest's snapshot testing for instance, or any other tools you might want to use in testing.

This project comes to rescue with TypeScript types to string serialization using TypeScript compiler API.

## Getting started
1. Install

```bash
npm install intspector
```

2. Start using with your project's `tsconfig.json`!

```typescript
import { inspect } from 'intspector';

inspect('typeof Math.random()') // "number"
```

## API

See full public API typedoc [documentation](https://grissius.github.io/intspector/).

### Inspect functions

`inspect` inspects a single type or multiple types if provided an object

```typescript
inspect('Record<keyof any, Array<number>>'); // "{ [x: string]: number[]; [x: number]: number[]; };"
inspect({a: 'string | number', b: 'boolean'}); // {a: "string | number", b: "boolean"}
```

`inspectWithPreamble` HOF returning `inspect` with code to be executed beforehand.
The inspect is still the same function: can take object or string.

```typescript
const inspectWithFoo = inspectWithPreamble('const foo = 2');
inspectWithFoo('typeof foo'); // "2"
inspectWithFoo({ foo: 'typeof foo' }); // { foo: "2" }
```

### Options functions

`getOptions` to see what you are working with

```typescript
const opts = getOptions();
// opts contain current options
```

`setOptions` to override your project defaults

```typescript
import * as ts from 'typescript';

const opts = setOptions({ strict: false, module: ts.ModuleKind.CommonJS });
// opts contain current options
```

## Advanced usage
You can self-reference your types
```typescript
const res = inspectObject({
    a: 'string',
    b: 'a | Promise<a>',
});
// res: { a: "string", b: "string | Promise<string>" }
```

You can import your types and all imports, or even put any amount of valid code into preamble.
```typescript
const myInspect = inspectObjectWithPreamble(`
import { foo } from 'bar'; // foo = 1 + 1
const ans = () => 42;
const ran = 'foo'.toUpperCase();
type Complex = { r: number; i: number };`);
const res = myInspect({
    foo: 'typeof foo',
    ansRes: 'ReturnType<typeof ans>',
    typeOfRan: 'typeof ran',
    real: "Pick<Complex, 'r'>",
});
// res: { foo: "number", ansRes: 'number', typeOfRan: 'string', real: '{ r: number; }' }
```

## See also

- [`resolve-types`](https://github.com/paulkoerbitz/resolve-types) - Forked from. Has some bugs fixed in this project and slightly different API. Worth cheking out.
- [`dtslint`](https://github.com/Microsoft/dtslint) - This is kind of a standard when testing types - it's from Microsoft and is widely used. However it uses Lint as the test runner, which is obscure. I found it kind of difficult to setup and integrate to a project and it uses TSLint, which is going to be [deprecated in 2019](https://github.com/palantir/tslint/issues/4534).

## Credits

This project is a fork of [resolve-types](https://github.com/paulkoerbitz/resolve-types). After using the original project I reported some issues ([#1](https://github.com/paulkoerbitz/resolve-types/issues/1), [#2](https://github.com/paulkoerbitz/resolve-types/issues/2), [#3](https://github.com/paulkoerbitz/resolve-types/issues/3)), but got no reply. The project was too special and too good to let go. So I created this fork to fix some of the issues and make the API easier to use.

Apart from the fixes, I changed a lot, but still use some of the core functions to operate the Typescript compiler and thanks to the original project I learned how to cat :cat2:.

**So thanks [paulkoerbitz](https://github.com/paulkoerbitz)** :heart:


## License

This project is licensed under [MIT](./LICENSE).
