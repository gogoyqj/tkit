import { useEffect, useMemo, useCallback } from 'react';
import { TkitUtils } from 'tkit-types';
import { EventCenter } from './event';

export function useEvent<F extends (...args: any) => any>(e: string, fn: F, once: boolean = false) {
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
        EventCenter.emit.apply(EventCenter, [e].concat(args));
      },
      off
      // @IMP: as - 虽然不知道为什么，但是这修复了 emit 类型推断不正常的问题
    ] as [F, typeof off];
  }, [e, off]);
}
