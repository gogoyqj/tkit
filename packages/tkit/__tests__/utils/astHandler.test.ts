import path from 'path';
import { VariableDeclarationKind } from 'ts-morph';
import fs from 'fs-extra';
import { createProject, astHandler, handleVars, handleImport } from '@src/utils/astHandler';

describe('utils/astHandler', () => {
  const tmp = 'tmp';
  const projectDirectory = path.join(__dirname, '..', '..', tmp);
  const project = createProject({
    tsConfigFilePath: undefined,
    compilerOptions: {}
  });
  const varsFile = `${tmp}/vars-file.ts`;
  const importFile = `${tmp}/import-file.ts`;
  const fileMap = {
    [varsFile]: `
const arr: number[] = [];
const obj = {};
const reducers: Reducer[] = [];
    `.trim(),
    [importFile]: ``
  };

  const varsToInject = [
    {
      declarationKind: 'const' as VariableDeclarationKind,
      declarations: [
        {
          name: 'arr',
          initializer: '1'
        },
        {
          name: 'arr',
          initializer: '2'
        },
        {
          name: 'obj',
          initializer: '...{a: 1, b: 2}'
        },
        {
          name: 'reducers',
          initializer: 'state => ({ ...state })'
        },
        {
          name: 'newVar',
          initializer: '200'
        }
      ]
    }
  ];

  beforeAll(() => {
    fs.removeSync(projectDirectory);
  });

  afterAll(() => {
    fs.removeSync(projectDirectory);
  });

  it('should handleVars works ok', () => {
    const root = project.createSourceFile(varsFile, fileMap[varsFile]);
    handleVars(root, {
      vars: varsToInject
    });
    const nodes = root.getChildren();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].getFullText()).toMatchSnapshot();
  });

  it('should handleImport works ok', () => {
    const root = project.createSourceFile(importFile, fileMap[importFile]);
    handleImport(root, {
      moduleSpecifier: 'testModule',
      namedImports: ['a', 'default as B']
    });
    handleImport(root, {
      moduleSpecifier: 'testModule2',
      defaultImport: 'testModule2'
    });
    handleImport(root, {
      moduleSpecifier: 'testModule2',
      namedImports: ['default as C']
    });
    const nodes = root.getChildren();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].getFullText()).toMatchSnapshot();
  });

  it('should astHandler works ok', async () => {
    const varsFile2 = `${varsFile}2`;
    const importFile2 = `${importFile}2`;
    project.createSourceFile(varsFile2, fileMap[varsFile]);
    project.createSourceFile(importFile2, fileMap[importFile]);
    project.saveSync();
    await astHandler(
      {
        [varsFile2]: {
          vars: varsToInject
        },
        [importFile2]: {
          moduleSpecifier: 'testModule2',
          defaultImport: 'testModule2',
          namedImports: ['a', 'default as B']
        }
      },
      'add',
      {
        tsConfigFilePath: undefined,
        compilerOptions: {
          rootDir: projectDirectory,
          baseUrl: '.'
        }
      }
    );
    expect(
      fs.readFileSync(path.join(projectDirectory, '..', varsFile2), { encoding: 'utf8' })
    ).toMatchSnapshot();

    expect(
      fs.readFileSync(path.join(projectDirectory, '..', importFile2), { encoding: 'utf8' })
    ).toMatchSnapshot();
  });
});
