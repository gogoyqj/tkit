import argvParser from '@src/argvParser';

describe('scripts/argvParser', () => {
  it('should argvParser works ok', () => {
    expect(argvParser(['--a', '--b', 'b', '--c-d', '--e-f', 'b', '--GH'])).toMatchSnapshot();
  });
});
