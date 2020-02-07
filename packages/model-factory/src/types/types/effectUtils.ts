/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2020-02-07 11:04:55
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 15:31:16
 */

import { BaseEffectsUtils, EffectOptions } from './model/effects';

/** 对 effect 进行包裹，例如公共 loading、tips */
export interface IEffectWrapper {
  <T extends BaseEffectsUtils, A, S>(
    effect: S,
    /** 提供 tPut、tCall 的工具 */
    effectsUtils: T,
    effectName: string,
    options?: EffectOptions
  ): any;
}

/** 关联 store 和 effect */
export interface IEffectFactory {
  <A, S>(effect: S, effectName: string, options: EffectOptions): any;
}
