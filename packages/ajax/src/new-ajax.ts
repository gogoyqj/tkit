/**
 * @author: yangqianjun
 * @file: ajax封装
 * @Date: 2019-11-21 15:25:51
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 20:38:12
 */
import qs from 'qs';
import axios from 'axios';
import axiosInst, { onStatusError, emptyFunc } from './axios';
import { promiseFactory } from './consts';

/** 不再兼容非标准的数据结构 */
export declare type AjaxPromise<R> = Promise<R>;
/** 非标准包裹 */
export declare type NonStandardAjaxPromise<R> = Promise<{
  code?: number;
  message?: string;
  result: R;
}>;

export interface ExtraFetchParams {
  /** extra data for extends */
  extra?: any;
  /** 扩展请求头 */
  headers?: any;
  /** cancel request */
  cancel?: Promise<string | undefined>;
}

export interface WrappedFetchParams extends ExtraFetchParams {
  /** http method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH' | 'HEAD';
  url: string;
  /** post json data */
  data?: any;
  /** post form data */
  form?: any;
  /** query data */
  query?: any;
  /** header */
  header?: any;
  /** path data */
  path?: any;
}
const testUser =
  typeof location !== 'undefined' && qs.parse(location.search.split('?')[1]).testUser;
export class WrappedFetch {
  /** ajax 方法 */
  public ajax(
    { method, url, data, form, query, header, extra, cancel, headers }: WrappedFetchParams,
    path?: string,
    basePath?: string
  ) {
    let config = {
      ...extra,
      method: method.toLowerCase(),
      headers: { ...headers, ...header }
    };
    if (testUser) {
      config.headers['Test-User'] = testUser;
    }
    // json
    if (data) {
      config = {
        ...config,
        headers: {
          // 可覆盖
          'Content-Type': 'application/json',
          ...config.headers
        },
        data
      };
    }
    // form
    if (form) {
      config = {
        ...config,
        headers: {
          // 可覆盖
          'Content-Type': 'application/x-www-form-urlencoded',
          ...config.headers
        },
        data: qs.stringify(form)
      };
    }
    const [{ resolve: cancelRequest }, internalCancel] = promiseFactory<string>();
    config.cancelToken = new axios.CancelToken(c => {
      // 外部
      cancel && cancel.then(c, emptyFunc);
      // 内部自动取消
      internalCancel.then(c, emptyFunc);
    });
    const prom: Promise<any> = axiosInst
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
    // IMP: 修复 tkit/service 设计上的硬伤
    prom['cancel'] = cancelRequest;
    return prom as Promise<any>;
  }

  /** 接口传参校验 */
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
