import path from 'path';
import fs from 'fs';
import { VariableDeclarationKind } from 'ts-morph';

export const CONST = 'const' as VariableDeclarationKind;
export const OPTIONS = {
  async: ['-a, --async', 'auto async in features/xxx/index.tsx'],
  connect: ['-c, --connect', 'connect with redux'],
  event: ['-e, --event', 'wrapp with EventWrapper'],
  force: ['-f, --force', 'overlap if file already exists'],
  hooks: ['-k, --hooks', 'import react hooks in presenter'],
  mobile: [
    '-m, --mobile [mobile]',
    'create Component or Presenter like .h5.ts, if set web, then .web.ts[only if default is mobile]'
  ],
  pure: ['-p, --pure', 'use React.PureComponent insted of React.Component'],
  url: ['-u, --url', "create 'NamePage' like Component"],
  wrap: [
    '-w, --wrap [wrap]',
    "wrap 'create component or presenter' in a sub directory, default: true",
    true
  ],
  local: [
    '-l, --local',
    "create localModel that won't connect with global store, default: false",
    false
  ]
};
export const coreDirectory = path.join(__dirname, '..');
export const templatesDir = path.join(coreDirectory, 'templates');
export const appDirectory = fs.realpathSync(process.cwd());
export const baseSourceDir = path.join(appDirectory, 'src');
export const baseTestsDir = path.join(appDirectory, '__tests__');
