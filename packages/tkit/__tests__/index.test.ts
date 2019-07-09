import path from 'path';
import fsX from 'fs-extra';
import { ProjectOptions } from 'ts-morph';

import { action } from '@src/index';
import { astHandler, OperationFileMap, OperationType } from '@src/utils/astHandler';
import { coreDirectory } from '@src/consts';

const featuresDirectory = path.join(coreDirectory, 'src', 'features');
const testsDirectory = path.join(coreDirectory, 'tests');

function clearBoilerplate() {
  fsX.removeSync(featuresDirectory);
  fsX.removeSync(testsDirectory);
}

// @cc: 必须置于顶层
jest.mock('@src/utils/astHandler');

const { clearASTLogs, ASTLogs } = (() => {
  const ASTLogs: any[] = [];
  (astHandler as jest.Mock).mockImplementation(
    (fileMapToInject: OperationFileMap, action: OperationType, config?: ProjectOptions) => {
      ASTLogs.push([
        Object.keys(fileMapToInject).reduce((o, file) => {
          const relative = file.split(coreDirectory)[1];
          o[relative] = fileMapToInject[file];
          return o;
        }, {}),
        action,
        config
      ]);
    }
  );
  return { clearASTLogs: () => ASTLogs.splice(0, ASTLogs.length), ASTLogs };
})();

// @cc: 必须置于顶层
// const writeFileSync = jest.spyOn(fsX, 'writeFileSync');
const { WriteLogs, clearWriteLogs, writeFileSync } = (() => {
  const WriteLogs: any[] = [];

  const writeFileSync = (fsX.writeFileSync = jest.fn(
    (file: string, content: string, config: any) => {
      // @cc: 只校验文件名是否符合预期
      WriteLogs.push([file.split(coreDirectory)[1]]);
    }
  ));

  return {
    clearWriteLogs: () => WriteLogs.splice(0, WriteLogs.length),
    WriteLogs,
    writeFileSync
  };
})();

describe('tkit-core', () => {
  afterEach(async () => {
    clearASTLogs();
    clearWriteLogs();
    await new Promise(rs => setTimeout(rs, 100));
  });
  beforeAll(() => {
    clearBoilerplate();
  });

  afterAll(() => {
    clearBoilerplate();
  });

  it('should add Component/init works ok', () => {
    clearBoilerplate();
    action('Component', 'admin/home', { force: true });
    expect(astHandler).toBeCalled();
    expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });

  it('should add Component/directory/no-init works ok', () => {
    action('Component', 'admin/directory/home', { force: true });
    expect(astHandler).toBeCalled();
    // expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });

  it('should add Component/no-init/wrap works ok', () => {
    action('Component', 'admin/home', { force: true, wrap: true, url: true });
    expect(astHandler).toBeCalled();
    // expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });

  it('should add Component/no-init/url works ok', () => {
    action('Component', 'admin/home', { force: true, wrap: true, url: true });
    expect(astHandler).toBeCalled();
    // expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });

  it('should add Presenter/no-init works ok', () => {
    action('Presenter', 'admin/home', { force: true });
    expect(astHandler).toBeCalled();
    // expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });

  it('shoul add Model/no-init works ok', () => {
    action('Model', 'admin/userModel', { force: true });
    expect(astHandler).toBeCalled();
    expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });

  it('shoul add List/no-init works ok', () => {
    action('List', 'admin/userList', { force: true });
    expect(astHandler).toBeCalled();
    expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });

  it('shoul add Action/no-init works ok', () => {
    action('Action', 'admin/userInfo', { force: true });
    expect(astHandler).toBeCalled();
    expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });

  it('shoul add Selector/no-init works ok', () => {
    action('Selector', 'admin/selectUser', { force: true });
    expect(astHandler).toBeCalled();
    // expect(ASTLogs.length).toBeGreaterThan(0);
    expect(ASTLogs).toMatchSnapshot();

    expect(writeFileSync).toBeCalled();
    expect(WriteLogs.length).toBeGreaterThan(0);
    expect(WriteLogs).toMatchSnapshot();
  });
});
