/**
 * @description ts ast 操作封装
 */
import path from 'path';
import {
  Project,
  ProjectOptions,
  IndentationText,
  QuoteKind,
  VariableDeclarationKind,
  SourceFile,
  ImportDeclarationStructure
} from 'ts-morph';
import { appDirectory } from '../consts';

export const defaultIndentationText = '  ';

export function defaultCodeWriter(
  type: string,
  bodyArr: string[],
  indentationText = defaultIndentationText,
  start = '',
  end = ''
) {
  switch (type) {
    default:
      return `${start ? `${start}\n` : ''}${
        bodyArr.length ? `${indentationText}${bodyArr.join(`,\n${indentationText}`)}` : ''
      }${end ? `\n${end}` : ''}`;
  }
}

export type OperationType = 'remove' | 'add';
export interface OperationConfig {
  moduleSpecifier?: string;
  vars?: {
    declarationKind: VariableDeclarationKind;
    declarations: {
      name: string;
      initializer: string;
    }[];
    codeWriter?: typeof defaultCodeWriter;
  }[];
  namedExports?: string | string[];
  namedImports?: string | string[];
  defaultImport?: string;
}
export interface OperationFileMap {
  [filePath: string]: OperationConfig;
}

export function createProject(config?: ProjectOptions) {
  return new Project({
    manipulationSettings: {
      quoteKind: "'" as QuoteKind,
      indentationText: '  ' as IndentationText
    },
    tsConfigFilePath: path.join(appDirectory, 'tsconfig.json'),
    ...config
  });
}

export async function astHandler(
  fileMapToInject: OperationFileMap,
  action: OperationType = 'add',
  config?: ProjectOptions
) {
  console.time('parse');
  const isRemove = action === 'remove';
  const project = createProject(config);
  Object.keys(fileMapToInject).forEach(file => {
    // const root = project.addExistingSourceFile(file, fs.readFileSync(file, { encoding: 'utf8' }));
    const root = project.addExistingSourceFile(file);
    const config = fileMapToInject[file];
    if (typeof config !== 'object' || Array.isArray(config)) {
      return console.error(`Error: ${file} with invalid config`);
    }
    if (config.namedImports) {
      if (!Array.isArray(config.namedImports)) {
        config.namedImports = [config.namedImports];
      }
    }
    if (config.vars) {
      if (!Array.isArray(config.vars)) {
        config.vars = [config.vars];
      }
    }
    if (config.namedExports) {
      if (!Array.isArray(config.namedExports)) {
        config.namedExports = [config.namedExports];
      }
    }
    handleVars(root, config, isRemove);
    handleImport(root, config, isRemove);
    // hanleExport(root, config, isRemove);
  });
  await project.save();
  console.timeEnd('parse');
}

export function handleVars(
  root: SourceFile,
  config: Pick<OperationConfig, 'vars'>,
  isRemove: boolean = false
) {
  if (config.vars) {
    const { vars } = config;
    vars.forEach(v => {
      const { declarationKind, declarations, codeWriter = defaultCodeWriter } = v;
      if (Array.isArray(declarations)) {
        let newDeclarations = declarations;
        root.getVariableStatement(decl => {
          const _declarationKind = decl.getDeclarationKind();
          const namesNode = decl.getDeclarations();
          if (_declarationKind === declarationKind) {
            namesNode.forEach(nameNode => {
              const nameString = nameNode.getName();
              newDeclarations = newDeclarations.filter(declaration => {
                let { name, initializer } = declaration;
                if (nameString === name) {
                  const initializerNodes = nameNode.getInitializer();
                  if (initializerNodes) {
                    const arrStartNode = initializerNodes.getFirstChild();
                    let arrStart = arrStartNode && arrStartNode.getText();
                    const arrEndNode = initializerNodes.getLastChild();
                    let arrEnd = arrEndNode && arrEndNode.getText();
                    const initializers = [];
                    let exitst;
                    if (
                      (arrStart === '[' || arrStart === '{') &&
                      (arrEnd === ']' || arrEnd === '}')
                    ) {
                      initializerNodes.forEachChild(initializerNode => {
                        const initializerString = initializerNode.getText();
                        if (initializerString === initializer) {
                          exitst = true;
                          if (!isRemove) {
                            initializers.push(initializerString);
                          }
                        } else {
                          initializers.push(initializerString);
                        }
                      });
                    } else {
                      // 非数组、对象：替换
                      arrStart = arrEnd = '';
                    }
                    if (!exitst) {
                      initializers.push(initializer);
                    }
                    nameNode.setInitializer(
                      codeWriter(
                        'initializer',
                        initializers,
                        defaultIndentationText,
                        arrStart,
                        arrEnd
                      )
                    );
                  }
                  return false;
                }
                return true;
              });
            });
          }
          return false;
        });
        if (newDeclarations.length) {
          const statement = root.addVariableStatement({
            declarationKind,
            declarations: newDeclarations
          });
          statement.setIsExported(true);
        }
      }
    });
  }
}

export function handleImport(
  root: SourceFile,
  config: Pick<OperationConfig, 'defaultImport' | 'namedImports' | 'moduleSpecifier'>,
  isRemove: boolean = false
) {
  let { moduleSpecifier, namedImports } = config;
  const importDeclaration = root.getImportDeclaration(dec => {
    return dec.getModuleSpecifier().getText() === `'${moduleSpecifier}'`;
  });
  if (importDeclaration) {
    // update or remove
    let oldNamedImports = (importDeclaration.getNamedImports() || []).map(a => a.getText());
    if (isRemove) {
      importDeclaration.remove();
    } else {
      if (config.defaultImport) {
        importDeclaration.setDefaultImport(config.defaultImport);
      }
      if ('defaultImport' in config) {
        importDeclaration.remove();
      }
      if (namedImports) {
        (Array.isArray(namedImports) ? namedImports : [namedImports]).forEach(newItem => {
          if (oldNamedImports.indexOf(newItem) === -1) {
            oldNamedImports.push(newItem);
          }
        });
        importDeclaration.removeNamedImports();
        importDeclaration.addNamedImports(oldNamedImports);
      } else if ('namedImports' in config) {
        importDeclaration.removeNamedImports();
      }
    }
  } else if (moduleSpecifier && !isRemove) {
    root.addImportDeclaration(config as ImportDeclarationStructure);
  }
}

/**
 * @description @todo
 */
export function handleDefaultExport(
  root: SourceFile,
  config: Pick<OperationConfig, 'namedExports'>,
  isRemove: boolean = false
) {
  const defaultExport = root.getDefaultExportSymbol();
}

/**
 * @description @todo
 */
export function hanleExport(root: SourceFile, config: OperationConfig, isRemove: boolean = false) {
  let { namedExports } = config;
  // const exportDeclaration = root.getExportedDeclarations(dec => {
  //   return dec.getModuleSpecifier().getText() === `'${moduleSpecifier}'`;
  // }
  const exportDeclaration = root.getExportedDeclarations();
  if (namedExports) {
    if (exportDeclaration) {
      const newAdd = [];
      exportDeclaration.forEach(declaration => {
        console.log(declaration);
      });
    }
  }
}
