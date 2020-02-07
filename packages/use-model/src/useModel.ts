/**
 * @description 基于 React Hooks 封装的 model，适用于局部状态
 */
import { useReducer, useMemo, useEffect, useRef } from 'react';
import { Tction, putWrapper, EffectOptions } from 'tkit-model-factory';
import { effectWrapper } from './effectWrapper';

export const tCall = <E extends (...args: any[]) => any>(
  effect: E,
  ...args: any[]
): ReturnType<E> => {
  console.error(`画蛇添足，请直接直接调用“effect.name”`);
  return effect.apply(args);
};

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
export default useModel;
