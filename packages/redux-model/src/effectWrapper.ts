/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2020-02-07 11:11:17
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 15:34:46
 */

import { cancelled } from 'redux-saga/effects';
import {
  EFFECTS_START,
  EFFECTS_END,
  FakeEffectFactory,
  EFFECTS_ERROR,
  IEffectWrapper,
  Tction
} from 'tkit-model-factory';

/** for Redux Model */
export const effectWrapper: IEffectWrapper = (effect, effects, effectName, options) => {
  const { tPut: put } = effects;
  /**
   * 默认不展示loading
   */
  const loading = (options && options.loading) || false;
  const silent = options && options.silent;
  /**
   * 局部Model不再使用gerator
   */
  return function* wrapper(action: Tction<any>) {
    yield put({ type: EFFECTS_START, payload: { effectName } } as any);
    const { getResolver, getRes, getEffect } = FakeEffectFactory({
      effectName,
      silent,
      loading
    });
    getEffect()();
    const res = getRes();
    try {
      if (typeof effect === 'function') {
        res.message = yield effect(effects, action);
      }
    } catch (e) {
      res.code = 10100;
      res.message = e && e['message'] ? e['message'] : e;
      yield put({ type: EFFECTS_ERROR, payload: { effectName } } as any);
    } finally {
      // IMP: 特殊处理saga cancel
      // eslint-disable-next-line no-constant-condition
      if ((yield cancelled()) || true) {
        yield put({ type: EFFECTS_END, payload: { effectName } } as any);
        // 隐藏 loading
        getResolver()(res);
      }
    }
  };
};
