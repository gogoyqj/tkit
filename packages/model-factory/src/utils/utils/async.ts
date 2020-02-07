/**
 * @file: 与 tkit-async 交互的逻辑
 * @author: yangqianjun
 * @Date: 2020-02-07 10:34:24
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 15:52:41
 */

import EventCenter from 'tkit-event-center';
import { IAsyncConfirmedMsg } from '../types';
import { ASYNC_EFFECT_EVENT_NAME, fakeEffectRes } from '../consts';

/** simulate an effect */
export const FakeEffectFactory = ({
  effectName,
  silent,
  loading
}: {
  effectName: string;
  /** whether do nothing */
  silent?: boolean;
  /** whether show loading */
  loading?: boolean;
}) => {
  let rs: (...args: any) => any = () => 0;
  const res: {
    code?: number;
    message?: React.ReactNode;
  } = {
    code: 0,
    message: false
  };
  const getMsg = () => typeof res.message !== 'object' && res.message;
  let interactEffect: Function = rs;
  // 自动模拟 loading & 成功错误信息效果
  if (silent !== true) {
    interactEffect = () => {
      res.code = 0;
      res.message = false;
      // IMP: 有些Effects可能是同步的，所以对rs的赋值必须是同步，而不是在fetch被调用的时候
      const prom = new Promise(resolve => {
        // IMP: fakeEffect must be successful // 我有点记不得这是为啥了
        // loading 交互效果由 prom mock 出来，在真正的 fetch effect 执行完成后 resolve
        // FIX: 如果恒返回 fakeEffectRes，那么错误信息就显示不出来
        rs = r => resolve(r || fakeEffectRes);
      });
      const asyncPayload: IAsyncConfirmedMsg = {
        fetch: () => prom,
        errorMsg: getMsg,
        successMsg: getMsg,
        effectName,
        indicator: loading === false ? loading : undefined,
        channel: 'tkit-model/effect'
      };
      EventCenter.emit(ASYNC_EFFECT_EVENT_NAME, {
        type: 'doAsyncConfirmed',
        payload: asyncPayload
      });
    };
  }
  return {
    getRes: () => res,
    getResolver: () => rs,
    getEffect: () => interactEffect
  };
};
