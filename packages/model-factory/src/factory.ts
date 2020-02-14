/**
 * Model工厂
 * @param model
 * @param model.namespace 命令空间
 * @param model.state 初始状态
 * @param model.reducers 推导reducers和同步actions
 * @param model.effects 副作用，推导异步actions
 */

import { produce } from 'immer';
import { createAction, handleActions } from 'tkit-actions';
import { TkitUtils } from 'tkit-types';
import { AbstractAction, Effects, Reducers, IEffectFactory, BaseEffectsUtils } from './types';
import { ModernType, defaultEffectOptions } from './consts';

export default function factory<
  M,
  R extends Reducers<M>,
  Utils extends BaseEffectsUtils,
  E extends Effects<Utils>
>(model: {
  /** 命名空间 */
  namespace: string;
  /**  初始状态 */
  state: M;
  reducers: R;
  effects?: E;
  /** modern 模式，引入 immer，解决 namespace 的问题 */
  m?: ModernType;
  /** effectWrapper */
  effectFactory?: IEffectFactory;
}) {
  type ReducerName = keyof R;
  type EffectName = keyof E;

  /**
   * ====================== Model Actions 类型计算 ======================
   */

  // IMP: 修复当 model effects 缺省的情况下，推断 TYPES 字符串类型错误的bug
  type ActionTypes = { [doSomething in ReducerName]: string } &
    { [doSomething in EffectName]: string };

  // IMP: 修复当 model effects 缺省的情况下，类型推断错误的bug
  type SyncActions = {
    [doSomething in ReducerName]: TkitUtils.GetArgumentsType<R[doSomething]>[1] extends
      | never
      | undefined
      ? () => any
      : <P extends TkitUtils.GetArgumentsType<R[doSomething]>[1]>(payload: P['payload']) => P;
  };

  // IMP: 修复当 model effects 缺省的情况下，类型推断错误的bug
  // model 的 reducers、effects 不能是泛型
  type AsyncActions = {
    [doSomething in EffectName]: TkitUtils.GetArgumentsType<
      TkitUtils.GetModelEffect<E[doSomething]>
    >[1] extends never | undefined
      ? () => any
      : <P extends TkitUtils.GetArgumentsType<TkitUtils.GetModelEffect<E[doSomething]>>[1]>(
          payload: P['payload']
        ) => P;
  };

  type Actions = SyncActions & AsyncActions;

  /**
   * ====================== Model Actions 逻辑实现 ======================
   */

  const { namespace, state, reducers, effects, m: modern, effectFactory } = model;
  const reducersMap: any = {};
  const TYPES: any = {};
  let actions = Object.keys(reducers).reduce<Actions>((actions, doSomething: ReducerName) => {
    type Action = typeof reducers[typeof doSomething];
    type Payload = TkitUtils.GetArgumentsType<Action>[1];
    const type = (TYPES[doSomething] = `${namespace}/${doSomething}`);
    // 引入 immer & 自动 namespace 隔离
    reducersMap[type] =
      modern === ModernType.ReduxModern
        ? <S>(state: S, action: AbstractAction) => {
            return {
              ...state,
              [namespace]: produce(state[namespace], draftState =>
                reducers[doSomething](draftState, action)
              )
            };
          }
        : modern === ModernType.HookModern
        ? <S>(state: S, action: AbstractAction) => {
            // cheat
            return produce(state, draftState => reducers[doSomething](draftState as any, action));
          }
        : reducers[doSomething];
    actions[doSomething] = ((payload: Payload['payload']) =>
      createAction(type, payload)) as Actions[typeof doSomething];
    return actions;
  }, {} as Actions);

  // TODO: Hooks Model 其实可以不执行下边的逻辑，在 useModel 会再重新覆盖一遍 actions[effectName]
  if (effects) {
    actions = Object.keys(effects).reduce((actions, doSomethingAsync: EffectName) => {
      type Action = typeof effects[typeof doSomethingAsync];
      type Payload = TkitUtils.GetArgumentsType<Action>[1];
      const type = (TYPES[doSomethingAsync] = `${namespace}/${doSomethingAsync}`);
      if (doSomethingAsync in actions) {
        console.error(`[Critical Error]: action '${doSomethingAsync}' already exists!!`);
      } else {
        actions[doSomethingAsync] = ((payload: Payload['payload']) =>
          createAction(type, payload)) as Actions[typeof doSomethingAsync];
        let effect = effects[doSomethingAsync];
        let effectOptions = defaultEffectOptions;
        if (Array.isArray(effect)) {
          effectOptions = { ...defaultEffectOptions, ...effect[1] };
          effect = effect[0];
        }
        effectFactory && effectFactory(effect, type, effectOptions);
      }
      return actions;
    }, actions);
  }

  return {
    state,
    actions,
    reducers: handleActions(reducersMap, state),
    TYPES: TYPES as ActionTypes,
    effects: { ...effects }, // force no undefined
    namespace,
    __model: model
  };
}
