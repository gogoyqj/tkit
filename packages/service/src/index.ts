/* eslint-disable @typescript-eslint/no-var-requires */
import * as path from 'path';
import * as fs from 'fs';
import * as request from 'request';
import chalk from 'chalk';

import { Json2Service, SwaggerParser, RemoteUrlReg, ProjectDir, SwaggerJson } from './consts';
import swagger2ts from './swagger2ts';
import serve from './yapi/serve';
import { pluginsPath, SmTmpDir, basePathToFileName, DefaultBasePath } from './init';
import { operationIdGuard, strictModeGuard } from './guard';
import { serveDiff } from './diff/serve';

const defaultParseConfig: Partial<SwaggerParser> = {
  '-l': 'typescript-angularjs',
  '-t': path.join(pluginsPath, 'typescript-tkit'),
  '-o': path.join(process.cwd(), 'src', 'services')
};
/** CLI入口函数 */
export default async function gen(
  config: Json2Service,
  options: {
    /** 是否清空上次生成目录 */
    clear?: boolean;
  }
): Promise<number> {
  const { url, remoteUrl, type = 'swagger', swaggerParser, requestConfig = {} } = config;
  if (!url || url.match(RemoteUrlReg)) {
    console.log(chalk.red(`[ERROR]: 自 @3.1.* url 必须是本地地址`));
    throw 1;
  }
  /** 当前版本 */
  const localSwaggerUrl = path.join(ProjectDir, url);

  /** 远程或本地新版本 */
  let remoteSwaggerUrl = (requestConfig.url = requestConfig.url || remoteUrl || '');
  if (remoteSwaggerUrl) {
    if (!remoteSwaggerUrl.match(RemoteUrlReg)) {
      remoteSwaggerUrl = path.join(ProjectDir, remoteSwaggerUrl);
      if (!fs.existsSync(remoteSwaggerUrl)) {
        console.log(chalk.red(`[ERROR]: remoteUrl 指定的文件 ${remoteUrl} 不存在`));
        throw 1;
      }
    }
  }

  if (type === 'yapi') {
    const yapiTMP = await serve(remoteSwaggerUrl, config.yapiConfig);
    if ('result' in yapiTMP && yapiTMP.result && !yapiTMP.code) {
      remoteSwaggerUrl = yapiTMP.result;
    } else {
      console.log(chalk.red(`[ERROR]: 基于 YAPI 生成失败: ${yapiTMP.message}`));
      throw 1;
    }
  }

  /** 写入本地版本 */
  const updateLocalSwagger = (data: SwaggerJson) => {
    fs.writeFileSync(localSwaggerUrl, data ? JSON.stringify(data, null, 2) : data, {
      encoding: 'utf8'
    });
  };

  const swagger2tsConfig = { ...defaultParseConfig, ...swaggerParser };
  const servicesPath = swagger2tsConfig['-o'] || '';
  const code: number = await new Promise(rs => {
    const loader = (cb: (err: any, res: { body?: SwaggerJson }) => any) => {
      remoteSwaggerUrl
        ? remoteSwaggerUrl.match(RemoteUrlReg)
          ? request.get(
              {
                ...requestConfig,
                url: remoteSwaggerUrl
              },
              (err, res) => cb(err, { body: JSON.parse(res.body) })
            )
          : cb(undefined, { body: require(remoteSwaggerUrl) as SwaggerJson })
        : cb(undefined, {});
    };
    loader(async (err, { body: newSwagger }) => {
      if (err) {
        console.log(chalk.red(`[ERROR]: 下载 Swagger JSON 失败: ${err}`));
        rs(1);
      } else {
        if (!fs.existsSync(servicesPath)) {
          fs.mkdirSync(servicesPath);
        }
        if (newSwagger) {
          if (fs.existsSync(localSwaggerUrl)) {
            // diff and patch
            const localSwagger: SwaggerJson = require(localSwaggerUrl);
            const merged = await serveDiff<SwaggerJson>(localSwagger, newSwagger);
            merged && updateLocalSwagger(merged);
          } else {
            updateLocalSwagger(newSwagger);
          }
        }
        rs(0);
      }
    });
  });
  if (code) {
    throw code;
  }
  // @IMP: 删除缓存
  delete require.cache[require.resolve(localSwaggerUrl)];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerData: SwaggerJson = require(localSwaggerUrl);
  const guardConfig = config.guardConfig || {};
  // @cc: tags 校验
  const warnings = Array<string>();
  {
    const { warnings: w, errors } = await strictModeGuard(swaggerData, guardConfig);
    warnings.push(...w);
    if (errors.length) {
      throw errors.join('\n');
    }
  }
  // @cc: 风险校验
  const { errors, warnings: w, suggestions } = await operationIdGuard(swaggerData, guardConfig);
  warnings.push(...w);
  if (warnings.length) {
    console.log(chalk.yellow(warnings.join('\n')));
  }
  // @IMP: 校正后的文件写入临时文件
  const swaggerFileName = basePathToFileName(`${swaggerData.basePath || DefaultBasePath}.json`);
  const swaggerPath = path.join(SmTmpDir, swaggerFileName);
  fs.writeFileSync(swaggerPath, JSON.stringify(swaggerData), {
    encoding: 'utf8'
  });
  if (errors.length) {
    if (suggestions.length) {
      console.log(chalk.green(JSON.stringify(suggestions, undefined, 2)));
    }
    throw errors.join('\n');
  } else {
    if (suggestions.length) {
      console.log(chalk.green(JSON.stringify(suggestions, undefined, 2)));
    }
  }
  const res = await swagger2ts({ ...swagger2tsConfig, '-i': swaggerPath }, options.clear);
  if (res.code) {
    throw `[ERROR]: gen failed with: ${res.message}`;
  } else {
    console.log(chalk.green(`[INFO]: gen success with: ${localSwaggerUrl}`));
    console.log(chalk.yellowBright(`[IMP] 请将文件 ${localSwaggerUrl} 添加到版本仓库`));
  }
  return 0;
}
