import sum from 'lib/math';

describe('Math', () => {
    test('sum', () => {
        expect(sum(1, 2)).toEqual(3);
    });
    test('sum with calculation', () => {
        expect(sum(5, 3, true)).toMatchSnapshot();
    });
});
