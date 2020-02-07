/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2020-02-07 17:41:31
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 18:33:09
 */

import * as sagaEffects from 'redux-saga/effects';
import { BaseEffectsUtils, MixWithPayload, EffectWithPayload, ItCall } from 'tkit-model-factory';

export type ReduxModelEffectsUtils = { tCall: ItCall } & BaseEffectsUtils & typeof sagaEffects;

/** redux model effects */
export interface ReduxModelEffects {
  [doSomethingAsync: string]:
    | MixWithPayload<ReduxModelEffectsUtils>
    | EffectWithPayload<ReduxModelEffectsUtils>;
}
