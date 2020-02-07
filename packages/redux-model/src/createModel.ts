/**
 * @author: yangqianjun
 * @file: 类似 dva model 的 TypeScript 封装
 * @Date: 2019-11-19 16:14:12
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 20:52:54
 */

import * as sagaEffects from 'redux-saga/effects';
import factory, {
  ItPut,
  ItCall,
  Reducers,
  ModernType,
  putWrapper,
  IEffectFactory
} from 'tkit-model-factory';
import { ReduxModelEffects, ReduxModelEffectsUtils } from './types';
import { effectWrapper } from './effectWrapper';

const { all, call } = sagaEffects;

export function globalPut<A>(action: A) {
  // 移除 @src/store
  return sagaEffects.put(action as any);
}

const wrappedPut = putWrapper(globalPut);

/** 用以替代 redux-saga put 的 typed 的 tPut */
export const tPut: ItPut = (effect: string, ...args: any[]) => {
  return wrappedPut(effect, ...args);
};

/** 用以替代 redux-saga call 的 typed tCall */
export const tCall: ItCall = <E extends (...args: any[]) => any>(
  effect: E,
  ...args: any[]
): Iterator<ReturnType<E>> => {
  // 不可以: sagaCall(effect, ...args)
  return call.apply(null, [effect, ...args]);
};

/**
 * Model工厂
 * @param model
 * @param model.namespace 命令空间
 * @param model.state 初始状态
 * @param model.reducers 推导reducers和同步actions
 * @param model.effects 副作用，推导异步actions
 */
export default function createModel<M, R extends Reducers<M>, E extends ReduxModelEffects>(model: {
  /** 命名空间 */
  namespace: string;
  /**  初始状态 */
  state: M;
  reducers: R;
  effects?: E;
  /** modern 模式，引入 immer，解决 namespace 的问题 */
  m?: ModernType;
}) {
  const { namespace } = model;
  const sagas: any[] = [];
  const TypedEffects: ReduxModelEffectsUtils = { ...sagaEffects, namespace, tPut, tCall };

  const effectFactory: IEffectFactory = (effect, type, options) => {
    const wrappedEffect = effectWrapper(effect, TypedEffects, type, options);
    switch (options.type) {
      case 'throttle':
        sagas.push(sagaEffects.throttle(options.ms || 100, type, wrappedEffect));
        break;
      case 'takeEvery':
      case 'takeLatest':
        sagas.push(sagaEffects[options.type](type, wrappedEffect));
        break;
    }
  };

  return {
    ...factory({
      ...model,
      effectFactory
    }),
    *sagas() {
      yield all(sagas);
    }
  };
}
