/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2019-12-17 20:16:34
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-19 11:15:12
 */
import { useEffect, useMemo, useCallback } from 'react';
import { TkitUtils } from 'tkit-types';
import { EventCenter } from './event';

export function useEvent<F extends (...args: any) => any>(e: string, fn: F, once = false) {
  const method = once ? 'once' : 'on';
  const off = useCallback(() => {
    EventCenter.off(e, fn);
  }, [e, fn]);
  useEffect(() => {
    EventCenter[method](e, fn);
    return off;
  }, [e, fn, method, off]);
  return useMemo(() => {
    return [
      (...args: TkitUtils.GetArgumentsType<F>) => {
        // eslint-disable-next-line prefer-spread
        EventCenter.emit.apply(EventCenter, [e].concat(args));
      },
      off
      // IMP: as - 虽然不知道为什么，但是这修复了 emit 类型推断不正常的问题
    ] as [F, typeof off];
  }, [e, off]);
}
