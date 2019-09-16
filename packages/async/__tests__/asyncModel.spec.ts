/**
 * @description 确保接口类型正常
 */
import { parser } from './parser';

const files = 'asyncFail.tsx asyncOK.tsx doFail.ts doOK.ts'.split(' ');

describe('tkit-async work ok', () => {
  const errors = parser(files, 'samples');
  files.forEach(file =>
    it(`check sample/${file} work ok`, () => {
      const current = errors[file];
      if (file.match(/OK/)) {
        expect(current).toHaveLength(0);
      } else if (file.match(/Fail/)) {
        expect(current.length).toBeGreaterThan(0);
      }
      expect(current).toMatchSnapshot();
    })
  );
});
