/**
 * Sum of two numbers
 * - Returns number or object in `{ sum, calculation }` format if `withCalculation` param is `true`
 * @param a - first number
 * @param b - second number
 * @param withCalculation
 */
const sum = (a: number, b: number, withCalculation = false) => {
    const sum = a + b;
    if (!withCalculation) {
        return sum;
    }
    return {
        sum,
        calculation: `${a} + ${b} = ${sum}`,
    };
};

export default sum;
