/**
 * @author: yangqianjun
 * @file: 确保接口类型正常
 * @Date: 2019-12-05 11:49:54
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-05 17:34:44
 */
import { parser } from './parser';

const files = 'responseOK.ts responseFail.ts'.split(' ');

describe('tkit-ajax work ok', () => {
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
