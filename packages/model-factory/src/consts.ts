import { EffectOptions } from './types';

/**
 * @file: 常量
 * @author: yangqianjun
 * @Date: 2020-02-06 16:27:23
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-06 17:30:29
 */

/** 默认副作用配置 */
export const defaultEffectOptions: EffectOptions = {
  type: 'takeEvery',
  ms: 100
};

/** 如引入 immer，枚举标记 redux 或者 react hooks */
export const enum ModernType {
  /** redux */
  ReduxModern = 0,
  /** useModel */
  HookModern = 1
}

/**
 * @file: model 常量
 * @author: yangqianjun
 * @Date: 2020-02-06 14:42:35
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-06 14:52:14
 */

/**
 * 执行 effect 广播的事件
 * 从 tkit-async 拆过来，以逐步解除 model & async 的循环引用
 */
export const ASYNC_EFFECT_EVENT_NAME = 'ASYNC_EFFECT_EVENT_NAME';

/** Redux Type 副作用开始 */
export const EFFECTS_START = 'EFFECTS_START';

/** Redux Type 副作用结束 */
export const EFFECTS_END = 'EFFECTS_END';

/** Redux Type 副作用错误 */
export const EFFECTS_ERROR = 'EFFECTS_ERROR';

/** Redux Type 副作用成功 */
export const EFFECTS_SUCCESS = 'EFFECTS_SUCCESS';

/**  副作用消息EventCenter事件 */
export const EFFECTS_MSG = 'EFFECTS_MSG';

export const fakeEffectRes = { code: 0 };
