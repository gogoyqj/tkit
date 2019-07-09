import React from 'react';
import { TkitUtils } from 'tkit-types';
import ajax from './new-ajax';

export * from './new-ajax';
export default ajax;
export interface TkitAbstractAjaxResult<R> {
  code?: number;
  message?: React.ReactNode;
  result?: R;
}
export type TkitAjaxResult = TkitAbstractAjaxResult<any>;
export type TkitAjaxFunction = TkitUtils.AbstractAsyncFunction<TkitAjaxResult>;
