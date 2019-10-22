import React from 'react';
import { TkitUtils } from 'tkit-types';
import ajax from './new-ajax';

export * from './new-ajax';
export default ajax;
export interface TkitAbstractAjaxResult<R> {
  /**
   * 后端返回的错误码或者提取非200的http状态码
   */
  code?: number;
  /**
   * 后端返回的错误信息
   */
  message?: React.ReactNode;
  /**
   * 后端返回的数据结构
   */
  result?: R;
}
export type TkitAjaxResult = TkitAbstractAjaxResult<any>;
export type TkitAjaxFunction = TkitUtils.AbstractAsyncFunction<TkitAjaxResult>;
