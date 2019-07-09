import qs from 'qs';
import axios, { onStatusError } from './axios';

export type AjaxPromise<R> = R extends { code?: number; result?: any; message?: any }
  ? Promise<R>
  : Promise<{ code?: number; result: R }>;

export interface ExtraFetchParams {
  extra?: any;
}

export interface WrappedFetchParams extends ExtraFetchParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH' | 'HEAD';
  url: string;
  data?: any; // post json
  form?: any; // post form
  query?: any;
  header?: any;
  path?: any;
}
const testUser = qs.parse(location.search.split('?')[1]).testUser;
export class WrappedFetch {
  /**
   * @description ajax 方法
   */
  public ajax(
    { method, url, data, form, query, header, extra }: WrappedFetchParams,
    path?: string,
    basePath?: string
  ) {
    let config = {
      ...extra,
      method: method.toLocaleLowerCase(),
      headers: { ...header }
    };
    // json
    if (data) {
      config = {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'application/json'
        },
        data
      };
    }
    // form
    if (form) {
      config = {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(form)
      };
    }
    return axios
      .request({
        ...config,
        url: testUser
          ? url.indexOf('?') === -1
            ? `${url}?testUser=${testUser}`
            : url.replace('?', () => `?testUser=${testUser}`)
          : url,
        params: query
      })
      .then(res => res.data)
      .catch(onStatusError);
  }

  /**
   * @description 接口传参校验
   */
  public check<V>(value: V, name: string) {
    if (value === null || value === undefined) {
      const msg = `[ERROR PARAMS]: ${name} can't be null or undefined`;
      // 非生产环境，直接抛出错误
      if (process.env.NODE_ENV === 'development') {
        throw Error(msg);
      }
    }
  }
}

export default new WrappedFetch();
