
import { resolveTypes, setOptions } from '.';

setOptions({ strict: false }, true);

console.log(resolveTypes`
type ${0} = string;
type ${1} = { a: number; b: string; c: [number, string]; };
`);
