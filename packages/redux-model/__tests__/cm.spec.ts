/**
 * @file: CM 语法层面测试
 * @author: yangqianjun
 * @Date: 2019-12-20 11:05:49
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-20 11:07:16
 */
import { parser } from './parser';

const files = 'testCMFail.ts testCMOK.ts'.split(' ');

describe('utils/useModel work ok', () => {
  const errors = parser(files, 'cmSamples');
  files.forEach(file =>
    it(`check cmSamples/${file} work ok`, () => {
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
