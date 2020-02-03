import loadsh from 'lodash';
import _ from 'src/utils/xlodash';

describe('utils/xloadsh', () => {
  it('should extends loadsh', () => {
    expect(_.add).toEqual(loadsh.add);
  });

  it('should pascalCase works ok', () => {
    expect(_.pascalCase('abc')).toEqual('Abc');
    expect(_.pascalCase('a_bc')).toEqual('ABc');
    expect(_.pascalCase('a_b_c')).toEqual('ABC');
  });

  it('should upperSnakeCase works ok', () => {
    expect(_.upperSnakeCase('abc')).toEqual('ABC');
    expect(_.upperSnakeCase('Abc')).toEqual('ABC');
    expect(_.upperSnakeCase('ABc')).toEqual('A_BC');
    expect(_.upperSnakeCase('AaBbCc')).toEqual('AA_BB_CC');
  });
});
