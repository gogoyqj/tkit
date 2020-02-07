/**
 * @file: typed call 接口定义
 * @author: yangqianjun
 * @Date: 2020-02-06 16:24:11
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 15:40:54
 */

import { TkitUtils } from 'tkit-types';

/** for Redux Model */
export interface ItCall {
  <E extends () => any>(effect: E): Iterator<ReturnType<E>>;
  <E extends (one: any) => any>(
    effect: E,
    args: TkitUtils.GetArgumentsType<E>[0] extends undefined
      ? never
      : TkitUtils.GetArgumentsType<E>[0]
  ): Iterator<ReturnType<E>>;
  <E extends (...args: any[]) => any>(effect: E, ...args: TkitUtils.GetArgumentsType<E>): Iterator<
    ReturnType<E>
  >;
}
