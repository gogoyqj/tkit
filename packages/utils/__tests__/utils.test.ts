import { concatDirectory } from 'src/utils';

describe('tkit-utils', () => {
  it('should concatDirectory works ok', () => {
    expect(concatDirectory(__dirname, 'xx')).toEqual([__dirname, 'xx'].join('/'));
  });
});
