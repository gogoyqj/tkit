/**
 * @file: useModel 语法层面测试
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-20 12:42:11
 */

import { parser } from './parser';

const files = 'testLocalModelFail.ts testLocalModelOK.ts testUseModelFail.ts testUseModelOK.ts testMMFail.ts testMMOK.ts'.split(
  ' '
);

describe('utils/useModel work ok', () => {
  const errors = parser(files, 'useModelSamples');
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
