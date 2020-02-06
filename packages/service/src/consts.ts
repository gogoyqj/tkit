import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';
import { JSONSchema4, JSONSchema6 } from 'json-schema';
import { CoreOptions } from 'request';

export type SMSchema = JSONSchema4 | JSONSchema6;

export interface PathJson {
  description?: string;
  operationId?: string;
  tags?: string[];
  summary?: string;
  consumes?: string[];
  parameters: {
    name?: string;
    in?: 'path' | 'form' | 'query' | 'body' | string;
    description?: string;
    required?: boolean;
    type?: string;
    schema?: SMSchema;
    format?: any;
  }[];
  responses: {
    [status: number]: {
      description: string;
      schema?: SMSchema;
    };
  };
  [extra: string]: any;
}

export interface SwaggerJson {
  __mtime?: any;
  swagger?: string;
  info?: any;
  tags?: {
    name?: string;
    description?: string;
  }[];
  paths: {
    [path: string]: {
      [method: string]: PathJson;
    };
  };
  definitions?: SMSchema;
  basePath: string;
  [extra: string]: any;
}

export interface SMAjaxConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH' | 'HEAD';
  url: string;
  data?: any; // post json
  form?: any; // post form
  query?: any;
  header?: any;
  path?: any;
  body?: any; // put json or form in body 2
}

export interface SMValidateInfo {
  swagger: { path: string; basePath: string };
  send: SMAjaxConfig;
  receive: {
    body?: any;
    status: number;
  };
  req: SMAbstractRequest;
  res: SMAbstractResponse;
}

export type SMAbstractRequest = IncomingMessage;

export type SMAbstractResponse = ServerResponse | IncomingMessage;

export type SMAbstractNext = (...args: any[]) => any;

export type SMValidator = (info: { code: number; message?: string; result: SMValidateInfo }) => any;

export const X_SM_PATH = 'x-sm-path';
export const X_SM_BASEPATH = 'x-sm-basepath';
export const X_SM_PARAMS = 'x-sm-params';
export const X_SM_ERROR = 'x-sm-error';

export type SwaggerGuardMode = 'strict' | 'safe';

export interface String2StringMap {
  [key: string]: string;
}

/** 生成代码法法名安全配置 */
export interface GuardConfig {
  /** OperationId到url映射 */
  methodUrl2OperationIdMap?: String2StringMap;
  /** 生成唯一 operationId 时， method 前边的前置，默认是 Using，例如: 'Using' + 'Get' */
  methodPrefix?: string;
  /** 模式: safe strict */
  mode?: SwaggerGuardMode;
  /** 采用url生成方法名时，需要移除的前缀正则，默认值：/^(\/)?api\//g */
  prefixReg?: RegExp;
  /** 参数格式不符合规范的正则，默认值：/[^a-z0-9_.[]$]/gi */
  badParamsReg?: RegExp;
  /** 不符合规范Tag正则，默认值：/^[a-z-0-9_$A-Z]+-controller$/g */
  unstableTagsReg?: RegExp;
  /** 检测Tag是否全英文，默认值：/^[a-z-0-9_$]+$/gi */
  validTagsReg?: RegExp;
  /** DTO命名是否符合规范正则，默认值：/^[a-z-0-9_$«»,]+$/gi */
  validDefinitionReg?: RegExp;
  /** 校验 url 规则，默认值： /api/g，自 3.1.6 新增 */
  validUrlReg?: RegExp;
}

export interface YAPIConfig {
  /**
   * 相应是否字段是否必须；当直接使用 yapi json 定义返回数据格式的时候，生成的 typescript 文件，默认情况下，所有字段都是可选的，配置成 true，则所有字段都是不可缺省的
   * */
  required?: boolean;
  /**
   * postJSON字段是否必须；当直接使用 yapi json 定义 json 格式 body 参数的时候，生成的 typescript 文件，默认情况下，所有字段都是可选的，配置成 true，则所有字段都是不可缺省的
   */
  bodyJsonRequired?: boolean;
  /**
   * 分类名中文=>英文映射；yapi 项目接口分类中英文映射，如 `{ "公共分类": "Common" }`
   */
  categoryMap?: String2StringMap | ((cate: string) => string);
}

/** CLI配置 */
export interface Json2Service {
  /** Swagger或者Mock JSON文档地址，自 3.1.* 起，请配置成本地文件 */
  url: string;
  /** 远程 url，配置成远程地址，用于增量更新使用；自 @3.1.* 支持 */
  remoteUrl?: string;
  /** 类型 yapi 或默认 swagger */
  type?: 'yapi' | 'swagger';
  /** 如果是 yapi，配置 */
  yapiConfig?: YAPIConfig;
  /** Swagger生成TS代码相关配置 */
  swaggerParser?: SwaggerParser;
  /** 生成自动校验逻辑 */
  validateResponse?: boolean;
  /** 方法名安全相关设置 */
  guardConfig?: GuardConfig;
  /** 拉取JSON文档请求相关设置 */
  requestConfig?: { url?: string } & CoreOptions;
}

/** Swagger Codegen配置 */
export interface SwaggerParser {
  /** 输出 typescript 代码目录，默认是当前 src/services */
  '-o'?: string;
  /** yapi 或者 swagger， 标记类型，默认是 swagger */
  '-t'?: string;
  /** 模板目录，默认是 typescript-angularjs，避免修改   */
  '-l'?: string;
  /** 输入文件 */
  '-i': string;
}

/** 项目目录 */
export const ProjectDir = process.cwd();
export const RemoteUrlReg = /^http/;
export const StaticDir = path.join(__dirname, '..', 'static');
