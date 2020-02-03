/**
 * @description 基于 React Hooks 封装的 model，适用于局部状态
 */
import { useReducer, useMemo, useEffect, useRef } from 'react';
import { TkitUtils } from 'tkit-types';
import createModel, {
  Reducers,
  CMReducers,
  LocalEffects,
  tCall,
  Tction,
  putWrapper,
  effectWrapper,
  EffectOptions,
  ModernType
} from './createModel';

declare global {
  interface Window {
    /**
     * 局部Model调试工具函数
     */
    __TKIT_USE_MODEL_LOGGER__: (...args: any) => any;
  }
}

/**
 * Model工厂
 * @param model
 * @param model.namespace 命令空间
 * @param model.state 初始状态
 * @param model.reducers 推导reducers和同步actions
 * @param model.effects 副作用，推导异步actions
 */
export function Model<M, R extends Reducers<M>, E extends LocalEffects>(model: {
  /** 命令空间，区分日志使用 */
  namespace: string;
  /** 初始状态 */
  state: M;
  reducers: R;
  effects: E;
}) {
  return createModel(model);
}

export function MM<M, R extends CMReducers<M>, E extends LocalEffects>(model: {
  /** 命令空间，区分日志使用 */
  namespace: string;
  /** 初始状态 */
  state: M;
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
  >({ ...model, m: ModernType.HookModern } as any);
}

export const M = Model;

const localOpts = { local: true };

// 层级嵌套的类型推断不好使
export function bindDispatchToAction<A, E, M extends { actions: A; effects: E; TYPES: any }>(
  actions: A,
  dispatch: ReturnType<typeof useReducer>[1],
  model: M
) {
  const { effects: modelEffects } = model;
  const put =
    process.env.NODE_ENV === 'test'
      ? <A>(action: A) =>
          require('react-dom/test-utils').act(() => {
            dispatch(action);
          })
      : dispatch;
  const wrappedPut = putWrapper(put);
  const effects = { tPut: wrappedPut, tCall, namespace: model['namespace'] };
  return Object.keys(actions).reduce((newActions, actionName) => {
    const originAction = actions[actionName];
    const originEffect = modelEffects[actionName];
    const opts: EffectOptions = Array.isArray(originEffect)
      ? { ...originEffect[1], ...localOpts }
      : localOpts;
    const effect = originEffect
      ? effectWrapper(
          Array.isArray(originEffect) ? originEffect[0] : originEffect,
          effects,
          model.TYPES[actionName],
          opts
        )
      : undefined;
    newActions[actionName] = (...args: any) => {
      const action = originAction(...args);
      dispatch(action);
      return effect && effect(action);
      // @IMP: 移除副作用执行器
      // exeGenerator(effect, action);
    };
    return newActions;
  }, {}) as typeof actions;
}

const commonReducer: (reducer: <M>(prevState: M, action: Tction<any>) => M) => any =
  process.env.NODE_ENV === 'development'
    ? reducer =>
        useMemo(
          () => <M>(prevState: M, action: Tction<any>) => {
            const newState = reducer(prevState, action);
            if (window.__TKIT_USE_MODEL_LOGGER__) {
              window.__TKIT_USE_MODEL_LOGGER__(
                'LOCAL ACTION',
                action['type'],
                prevState,
                action,
                newState
              );
            }
            return newState;
          },
          [reducer]
        )
    : reducer => reducer;

export const useModel = <
  M extends {
    reducers: any;
    actions: any;
    state: any;
    sagas: any;
    effects: any;
    TYPES: any;
    namespace: string;
  }
>(
  model: M,
  initialState: M['state'] = model['state']
) => {
  const [store, dispatch] = useReducer(commonReducer(model.reducers), initialState);
  const isNotUnmounted = useRef(true);
  // @IMP: 解除 dispatch 响应，避免内存泄露
  useEffect(() => {
    return () => {
      isNotUnmounted.current = false;
    };
  }, []);
  return [
    store,
    useMemo(
      () =>
        bindDispatchToAction(
          model.actions,
          // eslint-disable-next-line prefer-spread
          (...args) => isNotUnmounted.current && dispatch.apply(null, args),
          model
        ),
      [model, dispatch]
    )
  ] as [M extends { state: any } ? M['state'] : {}, M extends { actions: any } ? M['actions'] : {}];
};
export * from './createModel';
export default useModel;
