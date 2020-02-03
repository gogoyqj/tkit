/**
 * @author: yangqianjun
 * @file: ajax 常量
 * @Date: 2019-12-06 18:32:12
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-01-08 18:31:51
 */

import { TkitUtils } from 'tkit-types';

/** 取消请求错误码 */
export const AjaxCancelCode = 10499;
export const AjaxCancelMessage = 'AJAX_CANCEL_MESSAGE';

/** 默认Ajax错误码  */
export const AjaxErrorCode = 10001;

/** 无法确认的 Graphql 错误码 */
export const GraphQLErrorCode = 10002;

export interface TkitAbstractAjaxResult<R> {
  /**
   * 后端返回的错误码或者提取非200的http状态码
   */
  code?: number;
  /**
   * 后端返回的错误信息
   */
  message?: string | number | null;
  /**
   * 后端返回的数据结构
   */
  result?: R;
}
export type TkitAjaxResult = TkitAbstractAjaxResult<any>;
export type TkitAjaxFunction = TkitUtils.AbstractAsyncFunction<TkitAjaxResult>;
export const promiseFactory = <T>() => {
  let resolve!: (value?: T | PromiseLike<T> | undefined) => void, reject!: (reason?: any) => void;
  const prom = new Promise<T>((rs, rj) => {
    resolve = rs;
    reject = rj;
  });
  const rj = { reject, resolve };
  return [rj, prom] as [typeof rj, typeof prom];
};
