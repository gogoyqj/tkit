/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2020-02-06 19:48:29
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 18:30:32
 */

import 'react';
import {
  BaseEffectsUtils,
  HooksModelEffectWithPayload,
  MixHooksModelEffectWithPayload
} from 'tkit-model-factory';

declare global {
  interface Window {
    /**
     * 局部Model调试工具函数
     */
    __TKIT_USE_MODEL_LOGGER__: (...args: any) => any;
  }
}

/** useModel effects */
export interface HooksModelEffects {
  [doSomethingAsync: string]:
    | HooksModelEffectWithPayload<BaseEffectsUtils>
    | MixHooksModelEffectWithPayload<BaseEffectsUtils>;
}
