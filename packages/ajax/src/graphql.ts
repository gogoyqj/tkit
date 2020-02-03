/**
 * @author: yangqianjun
 * @file: thanks for https://github.com/prisma-labs/graphql-request
 * @Date: 2019-10-30 16:38:27
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-27 13:35:19
 */

import qs from 'qs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { GraphQLErrorCode } from './consts';
import { onStatusError, emptyFunc } from './axios';
import { ExtraFetchParams } from './new-ajax';

export interface Variables {
  [key: string]: any;
}

export interface Headers {
  [key: string]: string;
}

export interface GraphQLError {
  message:
    | string
    | {
        /** http status */
        statusCode: number;
        error: string;
      };
  locations: { line: number; column: number }[];
  path: string[];
}

export interface GraphQLResponse {
  data?: any;
  errors?: GraphQLError[];
  extensions?: any;
}

/** 提取错误信息、错误码 */
export function extractCodeAndMessage(errors: GraphQLError[]) {
  return errors.reduce(
    (res, { message }) => {
      if (typeof message === 'string') {
        res.message = (res.message ? `${res.message}\n` : res.message) + message;
      } else {
        const { error, statusCode } = message;
        if (statusCode === 401 || (statusCode === 403 && res.code !== 401)) {
          res.code = statusCode;
        }
        res.message += `${error}\n`;
      }
      return res;
    },
    {
      code: GraphQLErrorCode,
      message: ''
    }
  );
}
const testUser =
  typeof location !== 'undefined' && qs.parse(location.search.split('?')[1]).testUser;
export class GraphQLClient {
  private url: string;
  private options: AxiosRequestConfig;

  public constructor(url: string, options?: AxiosRequestConfig) {
    this.url = url;
    this.options = options || {};
  }

  public async request<T extends any>(
    query: string,
    variables?: Variables,
    opt?: ExtraFetchParams
    // IMP: 兼容 new-ajax.ts 设计
  ): Promise<any> {
    const { headers, ...others } = this.options;

    const body = JSON.stringify({
      query,
      variables: variables ? variables : undefined
    });
    const config: AxiosRequestConfig = {
      url: this.url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        // 调用时优先级更高
        ...(opt && opt.headers)
      },
      data: body,
      ...others
    };
    if (testUser) {
      config.headers['Test-User'] = testUser;
    }
    const cancel = opt && opt.cancel;
    if (cancel) {
      config.cancelToken = new axios.CancelToken(c => {
        cancel.then(c, emptyFunc);
      });
    }

    return axios.request(config).then((res: AxiosResponse<GraphQLResponse>) => {
      if (res.status === 200 && res.data && (!res.data.errors || !res.data.errors.length)) {
        return {
          code: 0,
          result: res.data.data
        };
      }
      return {
        result: res.data && res.data.data,
        ...extractCodeAndMessage(res.data.errors || [])
      };
    }, onStatusError);
  }

  public setHeaders(headers: AxiosRequestConfig['headers']): GraphQLClient {
    this.options.headers = headers;

    return this;
  }

  public setHeader(key: string, value: string): GraphQLClient {
    const { headers } = this.options;

    if (headers) {
      headers[key] = value;
    } else {
      this.options.headers = { [key]: value };
    }
    return this;
  }
}

export async function request<T extends any>(
  url: string,
  query: string,
  variables?: Variables,
  opt?: ExtraFetchParams
): Promise<{ code: number; message?: any; result?: T }> {
  const client = new GraphQLClient(url);

  return client.request<T>(query, variables, opt);
}

export default request;
