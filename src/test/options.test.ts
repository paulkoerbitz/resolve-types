import { getOptions, setOptions } from '..';

describe('Options', () => {
    test('getOptions', () => {
        expect(getOptions()).toMatchSnapshot();
    });
    test('setOptions', () => {
        const opts = setOptions({ strict: false });
        expect(opts).toMatchObject(getOptions());
        expect(opts).toMatchSnapshot();
    });
    test('setOptions (ignore)', () => {
        const opts = setOptions({ baseUrl: 'foo' }, true);
        expect(opts).toMatchObject(getOptions());
        expect(opts).toMatchSnapshot();
    });
});
