/**
 * @file: typed put 接口定义
 * @author: yangqianjun
 * @Date: 2020-02-06 16:33:01
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-06 16:35:07
 */

import { TkitUtils } from 'tkit-types';
import { Tction } from '../action';

/** typed put */
export interface ItPut {
  <E extends (...args: []) => any>(effect: E | string | Tction<any>): any;
  <E extends (one: any) => any>(
    effect: E | string | Tction<any>,
    args: TkitUtils.GetArgumentsType<E>[0] extends undefined
      ? E extends string
        ? any
        : never
      : TkitUtils.GetArgumentsType<E>[0]
  ): any;
  <E extends (...args: any[]) => any>(effect: E, ...args: TkitUtils.GetArgumentsType<E>): any;
}
