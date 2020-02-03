/**
 * @file: 为使用 docz Props 而 fake
 * @author: yangqianjun
 * @Date: 2019-12-18 16:25:12
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-01-08 18:45:18
 */
import React from 'react';
import { NonStandardAjaxPromise } from 'tkit-ajax';
import { IFetchState, IFetchConfig } from '../src';

export class FetchStateInterface extends React.Component<IFetchState> {}
export class FetchConfigInterface extends React.Component<IFetchConfig<any>> {}
interface IFR<R> extends IFetchState {
  /** 响应主体 */
  result: null | R;
  /** if conf.lazy, 手动拉取数据 */
  doFetch: () => NonStandardAjaxPromise<R>;
}
export class FetchReturnInterface extends React.Component<IFR<unknown>> {}
