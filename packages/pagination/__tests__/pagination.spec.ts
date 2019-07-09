import { parser } from './parser';

const files = 'testPaginationFail.ts testPaginationOK.ts'.split(' ');

describe('utils/pagination work ok', () => {
  const errors = parser(files, 'paginationSamples/');
  files.forEach(file =>
    it(`check sample/${file} work ok`, () => {
      const current = errors[file];
      if (file.match(/OK/)) {
        expect(current).toHaveLength(0);
      } else if (file.match(/Fail/)) {
        // expect(current.length).toBeGreaterThan(0);
      }
      expect(current).toMatchSnapshot();
    })
  );
});
