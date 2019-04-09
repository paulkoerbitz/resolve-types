import { getOptions } from 'main';

describe('Options', () => {
    test('getOptions', () => {
        expect(getOptions()).toMatchSnapshot();
    });
});
