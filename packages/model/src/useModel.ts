/**
 * @description 基于 React Hooks 封装的 model，适用于局部状态
 */
import { useReducer, useMemo } from 'react';
import createModel, {
  Reducers,
  LocalEffects,
  tCall,
  Tction,
  putWrapper,
  effectWrapper,
  exeGenerator
} from './createModel';

export function Model<M, R extends Reducers<M>, E extends LocalEffects>(model: {
  namespace: string;
  state: M;
  reducers: R;
  effects: E;
}) {
  return createModel(model);
}

export const M = Model;

// 层级嵌套的类型推断不好使
export function bindDispatchToAction<A, E, M extends { actions: A; effects: E }>(
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
    const effect = modelEffects[actionName]
      ? effectWrapper(modelEffects[actionName], effects)
      : undefined;
    newActions[actionName] = (...args: any) => {
      const action = originAction(...args);
      dispatch(action);
      if (effect) {
        exeGenerator(effect, action);
      }
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
            console.log('LOCAL ACTION', action['type'], prevState, action, newState);
            return newState;
          },
          [reducer]
        )
    : reducer => reducer;

export const useModel = <
  M extends { reducers: any; actions: any; state: any; sagas: any; effects: any }
>(
  model: M,
  initialState: M['state'] = model['state']
) => {
  const [store, dispatch] = useReducer(commonReducer(model.reducers), initialState);
  return [
    store,
    useMemo(() => bindDispatchToAction(model.actions, dispatch, model), [model, dispatch])
  ] as [M extends { state: any } ? M['state'] : {}, M extends { actions: any } ? M['actions'] : {}];
};
export * from './createModel';
export default useModel;
