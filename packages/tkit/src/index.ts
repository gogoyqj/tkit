/**
 * @description kit core
 */
import path from 'path';
import fsX from 'fs-extra';

import { astHandler } from './utils/astHandler';
import _ from './utils/xlodash';
import { OPTIONS, CONST, templatesDir, baseSourceDir, baseTestsDir, TSVersion } from './consts';

// @cc: 发现 eslint auto fix {}/type to interface cause bug
export type OptionType = { [opt in keyof typeof OPTIONS]?: boolean } & {
  mobile?: string;
  components?: string;
};

export interface Template {
  target: string;
  template?: string;
  templateStr?: string;
  exportCode?: {
    [filePath: string]: string;
  };
}

export type TemplateType = 'List' | 'Action' | 'Model' | 'Selector' | 'Presenter' | 'Component';

const featureMateriels = ['redux', 'selectors'];
export const handle = (
  feature: string,
  name: string,
  type: TemplateType,
  options: OptionType = {}
) => {
  let templateType = _.upperFirst(type); // Abb like
  const templates: Template[] = [];

  if (!type || !type.trim()) {
    return console.log(`Error: invalid type '${type}' found`);
  }

  if (templateType === 'List') {
    name = `${name.replace(/list$/gi, '')}List`;
  }

  // format
  const camelCaseFeature = _.camelCase(feature);
  feature = _.kebabCase(feature); // a-a-b like
  const lowerName = _.lowerCase(name);
  const camelName = _.camelCase(name); // aAB like
  const pascalName = _.pascalCase(name); // WordWordWord like

  const modelName = `do${pascalName.replace(/Model$/, '')}Model`;
  const actionName = `do${pascalName}`;
  const selectActionName = `doSelect${pascalName}`;
  const reducerName = `apply${pascalName}`;
  const sagaName = `saga${pascalName}`; // ?
  const selectorName = `get${pascalName}`;
  let presenterName = `SFC${pascalName}`;
  let componentName = pascalName;
  const constsName = _.upperSnakeCase(pascalName);
  const featureSagaName = `${camelCaseFeature}Saga`;
  const cssClassName = `k-${feature}-${_.kebabCase(name)}`;

  const pureStateName = `pure${pascalName}State`;

  const sourceDir = path.join(baseSourceDir, 'features', feature);
  const testsDir = path.join(baseTestsDir, 'features', feature);

  let targetSourceDir = sourceDir;
  let targetTestsDir = testsDir;

  const h5 = options.mobile ? (options.mobile === 'web' ? '.web' : '.h5') : '';
  const featureIndex = path.join(sourceDir, `index${h5}.ts`);

  // @IMP: 在generator处理上兼容3.6.*以下的typescript版本
  const isModernTS = TSVersion[0] > 3 || (TSVersion[0] === 3 && TSVersion[1] > 5) ? true : false;

  // init feature
  let needInit;
  if (!fsX.pathExistsSync(sourceDir)) {
    needInit = true;
    fsX.ensureDirSync(sourceDir);
    fsX.ensureDirSync(testsDir);
    templates.push({
      template: path.join(templatesDir, 'route.ts.tmpl'),
      target: path.join(sourceDir, 'route.ts')
    });
    templates.push({
      template: path.join(templatesDir, 'Index.ts.tmpl'),
      target: featureIndex
    });
    featureMateriels.forEach(materiel => {
      fsX.ensureDirSync(path.join(sourceDir, materiel));
      fsX.ensureDirSync(path.join(testsDir, materiel));
      fsX.copySync(path.join(templatesDir, materiel), path.join(sourceDir, materiel));
    });
  }

  if (!name || !name.trim()) {
    return;
  }

  // options
  const { async, connect, force, pure, url, event, wrap, hooks, local } = options;
  // 是否放到 components 子目录
  let components = options.components;
  let fileName = camelName;
  let exportCode = {};
  let ext = '.ts';
  const isPage = url && !pascalName.match(/Page$/g);
  let indexFile = featureIndex;
  switch (templateType) {
    case 'List':
      targetSourceDir = path.join(sourceDir, 'redux');
      targetTestsDir = path.join(testsDir, 'redux');
      exportCode = {
        // vscode syntax bug
        [path.join(targetSourceDir, 'sagas.ts')]:
          `export { ${sagaName} } from './${fileName}'` + ';\n'
      };
      astHandler({
        [path.join(targetSourceDir, 'actions.ts')]: {
          moduleSpecifier: `./${fileName}`,
          namedImports: `${actionName}, ${selectActionName}`,
          vars: [
            {
              declarationKind: CONST,
              declarations: [
                {
                  name: 'actions',
                  initializer: `${actionName}`
                },
                {
                  name: 'actions',
                  initializer: `${selectActionName}`
                }
              ]
            }
          ]
        },
        [path.join(targetSourceDir, 'initialState.ts')]: {
          moduleSpecifier: `./${fileName}`,
          namedImports: `${pureStateName}`,
          vars: [
            {
              declarationKind: CONST,
              declarations: [
                {
                  name: 'initialState',
                  initializer: `...${pureStateName}`
                }
              ]
            }
          ]
        },
        [path.join(targetSourceDir, 'reducer.ts')]: {
          moduleSpecifier: `./${fileName}`,
          namedImports: reducerName,
          vars: [
            {
              declarationKind: CONST,
              declarations: [
                {
                  name: 'reducers',
                  initializer: reducerName
                }
              ]
            }
          ]
        }
      });
      break;
    case 'Action':
      targetSourceDir = path.join(sourceDir, 'redux');
      targetTestsDir = path.join(testsDir, 'redux');
      exportCode = {};
      // async force to using saga
      if (async) {
        templateType = 'Saga';
        exportCode[path.join(targetSourceDir, 'sagas.ts')] =
          `export { ${sagaName} } from './${fileName}'` + ';\n';
      }
      // add initial state into initialState.ts
      astHandler({
        [path.join(targetSourceDir, 'actions.ts')]: {
          moduleSpecifier: `./${fileName}`,
          namedImports: `${actionName}`,
          vars: [
            {
              declarationKind: CONST,
              declarations: [
                {
                  name: 'actions',
                  initializer: `${actionName}`
                }
              ]
            }
          ]
        },
        [path.join(targetSourceDir, 'initialState.ts')]: {
          moduleSpecifier: `./${fileName}`,
          namedImports: `${pureStateName}`,
          vars: [
            {
              declarationKind: CONST,
              declarations: [
                {
                  name: 'initialState',
                  initializer: `...${pureStateName}`
                }
              ]
            }
          ]
        },
        [path.join(targetSourceDir, 'reducer.ts')]: {
          moduleSpecifier: `./${fileName}`,
          namedImports: reducerName,
          vars: [
            {
              declarationKind: CONST,
              declarations: [
                {
                  name: 'reducers',
                  initializer: reducerName
                }
              ]
            }
          ]
        }
      });
      break;
    case 'Model':
      targetSourceDir = path.join(sourceDir, 'redux');
      targetTestsDir = path.join(testsDir, 'redux');
      templateType = 'Model';
      if (local !== true) {
        astHandler({
          // @cc: saga 注册到所属的 sagas.ts
          [path.join(targetSourceDir, 'sagas.ts')]: {
            moduleSpecifier: `./${fileName}`,
            namedImports: `default as ${modelName}`,
            vars: [
              {
                declarationKind: CONST,
                declarations: [
                  {
                    name: `saga${pascalName}`,
                    initializer: `${modelName}.sagas`
                  }
                ]
              }
            ]
          },
          // @cc: action 注册到所属的 actions.ts
          [path.join(targetSourceDir, 'actions.ts')]: {
            moduleSpecifier: `./${fileName}`,
            namedImports: `default as ${modelName}`,
            vars: [
              {
                declarationKind: CONST,
                declarations: [
                  {
                    name: 'actions',
                    initializer: `...${modelName}.actions`
                  }
                ]
              }
            ]
          },
          // @cc: state 注册到所属的 initialState.ts
          [path.join(targetSourceDir, 'initialState.ts')]: {
            moduleSpecifier: `./${fileName}`,
            namedImports: `${camelName}State`,
            vars: [
              {
                declarationKind: CONST,
                declarations: [
                  {
                    name: 'initialState',
                    initializer: `...${camelName}State`
                  }
                ]
              }
            ]
          },
          // @cc: reducer 注册到所属的 reducer.ts
          [path.join(targetSourceDir, 'reducer.ts')]: {
            moduleSpecifier: `./${fileName}`,
            namedImports: `default as ${modelName}`,
            vars: [
              {
                declarationKind: CONST,
                declarations: [
                  {
                    name: 'reducers',
                    initializer: `${modelName}.reducers`
                  }
                ]
              }
            ]
          }
        });
      }
      break;
    case 'Selector':
      targetSourceDir = path.join(sourceDir, 'selectors');
      targetTestsDir = path.join(testsDir, 'selectors');
      exportCode = {
        // vscode syntax bug
        [path.join(targetSourceDir, 'index.ts')]:
          `export { ${selectorName} } from './${fileName}'` + ';\n'
      };
      break;
    case 'Presenter':
      components = options.components;
      if (components) {
        targetSourceDir = path.join(sourceDir, components);
        targetTestsDir = path.join(testsDir, components);
        indexFile = path.join(targetSourceDir, `index${h5}.ts`);
      }
      if (h5) {
        fsX.ensureFileSync(indexFile);
      }
      // stateless component
      presenterName = fileName = `SFC${pascalName}${isPage ? 'Page' : ''}`;
      fileName = `${fileName}${h5}`;
      exportCode = {
        [indexFile]: `export { default as ${presenterName} } from './${fileName}'` + ';\n'
      };
      ext = '.tsx';
      break;
    case 'Component':
      components = options.components;
      if (components) {
        targetSourceDir = path.join(sourceDir, components);
        targetTestsDir = path.join(testsDir, components);
        indexFile = path.join(targetSourceDir, `index${h5}.ts`);
      }
      if (h5) {
        fsX.ensureFileSync(indexFile);
      }
      componentName = fileName = `${pascalName}${isPage ? 'Page' : ''}`;
      fileName = `${fileName}${h5}`;
      exportCode = {
        [indexFile]: `export { default as ${componentName} } from './${fileName}'` + ';\n'
      };
      ext = '.tsx';
      break;
    default:
      return console.error(`Error: invalid type ${type} found`);
  }
  fsX.ensureDirSync(targetSourceDir);
  fsX.ensureDirSync(targetTestsDir);

  const renderData = {
    async: true,
    connect,
    force,
    pure,
    feature,
    url,
    event,
    components,
    wrap,
    hooks,
    local,

    name,
    cssClassName,
    pureStateName,
    actionName,
    modelName,
    reducerName,
    sagaName,
    pascalSagaName: _.pascalCase(sagaName),
    selectorName,
    presenterName,
    componentName,
    constsName,
    selectActionName,

    lowerName,
    camelName,
    pascalName,

    fileName,

    isModernTS
  };

  if (
    lowerName === 'index' ||
    lowerName === 'actions' ||
    lowerName === 'reducer' ||
    camelName === 'initialState' ||
    name === 'default' ||
    lowerName === 'saga'
  ) {
    return console.error(`Error: can't use ${name} as name`);
  }

  const isPresenter = templateType === 'Presenter';
  const isView = templateType === 'Component' || isPresenter;
  const finalPath =
    isView && wrap
      ? path.join(targetSourceDir, isPresenter ? presenterName : componentName)
      : targetSourceDir;

  ['', '.test'].forEach(pts => {
    const extName = `${pts}${ext}`;
    templates.push({
      exportCode,
      template: path.join(templatesDir, `${templateType}${extName}.tmpl`),
      target: path.join(pts === '.test' ? targetTestsDir : finalPath, `${fileName}${extName}`)
    });
  });

  if (isView) {
    templates.push({
      template: path.join(templatesDir, 'Less.tmpl'),
      target: path.join(finalPath, `${fileName}.less`)
    });
    // 生成 index.ts
    templates.push({
      target: path.join(finalPath, `index.ts`),
      templateStr: `export { default${connect ? `, ${fileName}` : ''} } from './${fileName}';`
    });
    fsX.ensureDirSync(finalPath);
  }

  templates.forEach(({ template = '', templateStr, target, exportCode }) => {
    if (fsX.pathExistsSync(template) || templateStr) {
      const res = _.template(templateStr || fsX.readFileSync(template, 'utf8'))(renderData);
      const old = fsX.pathExistsSync(target);
      if (old && !force) {
        console.error(`Error: ${target} alreay exists, use -f, --force to overlap it`);
      } else {
        if (old) {
          console.log(`Warning: overlap ${target}`);
        }
        fsX.writeFileSync(target, res.replace(/[\n]{3,}/g, '\n\n').trim(), { encoding: 'utf8' });
      }
      if (exportCode) {
        Object.keys(exportCode).forEach(fileToInject => {
          const code = exportCode[fileToInject];
          if (
            code &&
            (!fsX.existsSync(fileToInject) ||
              fsX.readFileSync(fileToInject, { encoding: 'utf8' }).indexOf(code.trim()) === -1)
          ) {
            fsX.writeFileSync(fileToInject, code, { encoding: 'utf8', flag: 'a+' });
          }
        });
      }
    } else {
      console.log(`Error: template ${template} not found`);
    }
  });

  // add Page into src/features/${feature}/route.ts
  if (isView && url) {
    // ms route.ts 的操作可能会有 bug ??
    const routePath = path.join(targetSourceDir, `route${h5}.ts`);
    if (h5) {
      fsX.ensureFileSync(routePath);
    }
    astHandler({
      [routePath]: {
        vars: [
          {
            declarationKind: CONST,
            declarations: [
              {
                name: 'childRoutes',
                initializer: `{
    load: loader('${templateType === 'Component' ? componentName : presenterName}'),
    path: '${_.kebabCase(typeof url === 'string' && url ? url : name)}'
  }`
              }
            ]
          }
        ]
      }
    });
  }
  if (needInit) {
    // add sagas.ts into src/common/rootSaga.ts
    astHandler({
      [path.join(baseSourceDir, 'common', 'routeConfig.ts')]: {
        moduleSpecifier: `@features/${feature}/route`,
        defaultImport: `${camelCaseFeature}Route`,
        vars: [
          {
            declarationKind: CONST,
            declarations: [
              {
                name: 'childRoutes',
                initializer: `${camelCaseFeature}Route`
              }
            ]
          }
        ]
      },
      [path.join(baseSourceDir, 'common', 'rootSaga.ts')]: {
        moduleSpecifier: `@features/${feature}/redux/sagas`,
        defaultImport: `* as ${featureSagaName}`,
        vars: [
          {
            declarationKind: CONST,
            declarations: [
              {
                name: 'featureSagas',
                initializer: featureSagaName
              }
            ]
          }
        ]
      },
      [path.join(baseSourceDir, 'common', 'rootReducer.ts')]: {
        moduleSpecifier: `@features/${feature}/redux/reducer`,
        defaultImport: `${camelCaseFeature}Reducer`,
        vars: [
          {
            declarationKind: CONST,
            declarations: [
              {
                name: 'reducerMap',
                initializer: `${camelCaseFeature}: ${camelCaseFeature}Reducer`
              }
            ]
          }
        ]
      }
    });
  }
};

export function action(type: TemplateType, featureAndname: string, options: OptionType = {}) {
  const [feature, name, cpName] = featureAndname.split('/');
  // 普通组件是否放到 components 目录或其他指定的目录，默认是 components
  if (cpName && !options.url) {
    options.components = name || 'components';
    // add components suffix for safe
    if (!options.components.match(/components/i)) {
      options.components = `${options.components}Components`;
    }
  }
  if (name || cpName) {
    handle(feature, cpName || name, type, options);
  }
}
