import { parser } from './parser';

const files = 'testCreateModelFail.ts testCreateModelOK.ts testCreateModelStateReadOnlyFail.ts testCreateModelStateReadOnlyOK.ts testCreateModelTYPESFail.ts testCreateModelTYPESOK.ts testPutCallInModelFail.ts testPutCallInModelOK.ts testPutCallOutModelFail.ts testPutCallOutModelOK.ts testPutCallWithOverloadFail.ts testPutCallWithOverloadOK.ts testWithEffectsPutAndCallFail.ts testWithEffectsPutAndCallOK.ts'.split(
  ' '
);

describe('utils/createModel work ok', () => {
  const errors = parser(files, 'createModelSamples');
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
