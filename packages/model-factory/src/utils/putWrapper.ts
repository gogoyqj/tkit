/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2020-02-06 18:09:08
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 20:48:18
 */

import { ItPut, Tction } from '../types';

/**
 * for Redux and Hooks Model dispatch wrapper
 * @param put Dispatch
 */
export function putWrapper(put: ItPut) {
  return <E>(effect: E, ...args: any) => {
    if (typeof effect === 'function') {
      return put(effect(...args));
    } else if (typeof effect === 'string') {
      // FIXME: 为什么是 args[1] ？？
      return put({ type: effect, payload: args[1] } as Tction<any>);
    } else if (typeof effect === 'object') {
      return put((effect as unknown) as Tction<any>);
    }
  };
}
