/**
 * @file: 集成 immer、并真正利用 namespace
 * @author: yangqianjun
 * @Date: 2019-12-20 09:32:15
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-20 12:04:33
 */

import { TkitUtils } from 'tkit-types';
import createModel, { CMReducers, Effects, ModernType } from './createModel';

export { Tction } from './createModel';

export function CM<M, R extends CMReducers<M>, E extends Effects>(model: {
  /** 命令空间，用以做自动 redux store 隔离 */
  namespace: string;
  /** 初始状态 */
  state: M;
  /** 集成 immer */
  reducers: R;
  effects: E;
}) {
  // cheat
  return createModel<
    M,
    {
      [doSomething in keyof R]: (
        state: M,
        action: TkitUtils.GetArgumentsType<R[doSomething]>[1]
      ) => M;
    },
    E
  >({ ...model, m: ModernType.ReduxModern } as any);
}
