/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 20:25:13
 */
import { parser } from './parser';

const files = 'testCreateModelFail.ts testCreateModelOK.ts testCreateModelStateReadOnlyFail.ts testCreateModelStateReadOnlyOK.ts testCreateModelTYPESFail.ts testCreateModelTYPESOK.ts testPutCallInModelFail.ts testPutCallInModelOK.ts'.split(
  ' '
);

describe('model-factory/createModel work ok', () => {
  const errors = parser(files, 'factorySamples');
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
