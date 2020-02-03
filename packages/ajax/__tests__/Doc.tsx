/**
 * @file: 为使用 docz Props 而 fake
 * @author: yangqianjun
 * @Date: 2019-12-18 16:25:12
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-01-08 18:48:37
 */
import React from 'react';
import {
  TkitAbstractAjaxResult,
  WrappedFetchParams,
  WrappedFetch,
  ExtraFetchParams,
  NonStandardAjaxPromise
} from '../src';

export class ResultInterface extends React.Component<TkitAbstractAjaxResult<any>> {}

export class ExtraFetchParamsInterface extends React.Component<ExtraFetchParams> {}
export class ParamsInterface extends React.Component<WrappedFetchParams> {}
export class FetchInterface extends React.Component<typeof WrappedFetch.prototype> {}
