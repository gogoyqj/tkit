#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import commander from 'commander'; // @fix no import * https://github.com/microsoft/tslib/issues/58
import gen from './index';

export interface Json2Service {
  url: string;
  type?: 'yapi' | 'swagger';
  yapiConfig?: {
    required?: boolean;
    bodyJsonRequired?: boolean;
  };
  swaggerParser?: SwaggerParser;
  validateResponse?: boolean;
}

export interface SwaggerParser {
  '-o'?: string;
  '-t'?: string;
  '-l'?: string;
  '-i': string;
}

const CD = process.cwd();

commander
  .version(require('../package.json').version)
  .option('-c, --config [type]', 'config file', 'json2service.json')
  .option('--clear [type]', 'rm typescript service before gen', false)
  .parse(process.argv);

const Config = commander.config as string;
const ConfigFile = path.join(CD, Config);

if (!fs.existsSync(ConfigFile)) {
  console.error(`[ERROR]: ${Config} not found in ${CD}`);
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config: Json2Service = require(ConfigFile);
  gen(config, { clear: commander.clear });
}
