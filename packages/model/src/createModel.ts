import * as sagaEffects from 'redux-saga/effects';
import { createAction, handleActions } from 'tkit-actions';
import { TkitUtils } from 'tkit-types';

export * from 'redux-saga/effects';

export const { all: sagaAll, call: sagaCall } = sagaEffects;

export const effects = sagaEffects;
export const EFFECTS_START = 'EFFECTS_START';
export const EFFECTS_END = 'EFFECTS_END';
export const EFFECTS_ERROR = 'EFFECTS_ERROR';

export interface Tction<P> {
  payload: P;
}

type AbstractAction = Tction<any>;

export interface Reducers<M> {
  [doSomething: string]:
    | (<P extends never>(state: Readonly<M>, action: P) => M)
    | (<P extends AbstractAction>(state: Readonly<M>, action: P) => M);
}

export function putWrapper(put = globalPut) {
  return <E>(effect: E, ...args: any) => {
    if (typeof effect === 'function') {
      put(effect(...args));
    } else if (typeof effect === 'string') {
      put({ type: effect, payload: args[1] });
    } else if (typeof effect === 'object') {
      put(effect);
    }
  };
}

const wrappedPut = putWrapper();

/**
 * @description 用以替代 redux-saga put 的 typed 的 tPut
 * @param effect model 或者 redux 创建的 action
 * @param args action 支持的参数
 * @cc: 当前版本，向下不兼容基于 redux-actions 创建的 action，只兼容 typesafe-action
 */
export function tPut<E extends (...args: []) => any>(effect: E | string | Tction<any>): any;
export function tPut<E extends (one: any) => any>(
  effect: E | string | Tction<any>,
  args: TkitUtils.GetArgumentsType<E>[0] extends undefined
    ? (E extends string ? any : never)
    : TkitUtils.GetArgumentsType<E>[0]
): any;
export function tPut<E extends (...args: any[]) => any>(
  effect: E,
  ...args: TkitUtils.GetArgumentsType<E>
): any;
export function tPut<E extends (...args: any[]) => any>(effect: E, ...args: any[]): any {
  return wrappedPut(effect, ...args);
}

export function globalPut<A>(action: A) {
  // @fix: 解除循环依赖 for commonjs
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@src/store').default.dispatch(action);
}
/**
 * @description 用以替代 redux-saga call 的 typed tCall
 * ```
 *  // 解决由于使用了 yield 造成 data 类型丢失的问题, TkitUtils.GetROA for short
 *  const data: TkitUtils.GetReturnTypeOfAsyncFun<typeof effect> = yield tCall(effect, args)
 * ``
 * @param effect effect 函数，如 service
 * @param args effect 函数的参数
 */
export function tCall<E extends () => any>(effect: E): ReturnType<typeof sagaCall>;
export function tCall<E extends (one: any) => any>(
  effect: E,
  args: TkitUtils.GetArgumentsType<E>[0] extends undefined
    ? never
    : TkitUtils.GetArgumentsType<E>[0]
): ReturnType<typeof sagaCall>;
export function tCall<E extends (...args: any[]) => any>(
  effect: E,
  ...args: TkitUtils.GetArgumentsType<E>
): ReturnType<typeof sagaCall>;
export function tCall<E extends (...args: any[]) => any>(
  effect: E,
  ...args: any[]
): ReturnType<typeof sagaCall> {
  // 不可以: sagaCall(effect, ...args)
  return sagaCall.apply(null, [effect, ...args]);
}
export interface BaseEffects {
  namespace: string;
  tPut: typeof tPut;
  tCall: typeof tCall;
}
export type CustomEffects = typeof sagaEffects & BaseEffects;

type AsyncEffectWithoutPayload = <P extends never>(saga: CustomEffects, action: P) => Promise<any>;
type AsyncEffectWithPayload = <P extends AbstractAction>(
  saga: CustomEffects,
  action: P
) => Promise<any>;
type EffectWithoutPayload = <P extends never>(saga: CustomEffects, action: P) => Iterator<{}>;
type EffectWithPayload = <P extends AbstractAction>(saga: CustomEffects, action: P) => Iterator<{}>;
type EffectType = 'takeEvery' | 'takeLatest' | 'throttle';
interface EffectOptions {
  type: EffectType;
  ms?: number;
}
export type MixWithoutPayload = [EffectWithoutPayload, EffectOptions];
export type MixWithPayload = [EffectWithPayload, EffectOptions];
export interface Effects {
  [doSomethingAsync: string]:
    | MixWithoutPayload
    | MixWithPayload
    | EffectWithoutPayload
    | EffectWithPayload
    | AsyncEffectWithPayload
    | AsyncEffectWithoutPayload;
}

export interface LocalEffects {
  [doSomethingAsync: string]: AsyncEffectWithPayload | AsyncEffectWithoutPayload;
}

const defaultEffectOptions: EffectOptions = {
  type: 'takeEvery',
  ms: 100
};

// effects dependences
export type Sagas = ((...args: any[]) => any)[];

export default function createModel<M, R extends Reducers<M>, E extends Effects>(model: {
  namespace: string;
  state: M;
  reducers: R;
  effects?: E;
}) {
  type ReducerName = keyof R;
  type EffectName = keyof E;
  // @fix: 修复当 model effects 缺省的情况下，推断 TYPES 字符串类型错误的bug
  type ActionTypes = { [doSomething in ReducerName]: string } &
    { [doSomething in EffectName]: string };
  // @fix: 修复当 model effects 缺省的情况下，类型推断错误的bug
  type SyncActions = {
    [doSomething in ReducerName]: (TkitUtils.GetArgumentsType<R[doSomething]>[1] extends
      | never
      | undefined
      ? () => any
      : (<P extends TkitUtils.GetArgumentsType<R[doSomething]>[1]>(payload: P['payload']) => P));
  };
  // @fix: 修复当 model effects 缺省的情况下，类型推断错误的bug
  type AsyncActions = {
    [doSomething in EffectName]: (TkitUtils.GetArgumentsType<
      TkitUtils.GetModelEffect<E[doSomething]>
    >[1] extends never | undefined
      ? () => any
      : (<P extends TkitUtils.GetArgumentsType<TkitUtils.GetModelEffect<E[doSomething]>>[1]>(
          payload: P['payload']
        ) => P));
  };
  type Actions = SyncActions & AsyncActions;
  const { namespace, state, reducers, effects } = model;
  const reducersMap: any = {};
  const TYPES: any = {};
  let actions = Object.keys(reducers).reduce(
    (actions, doSomething: ReducerName) => {
      type Action = typeof reducers[typeof doSomething];
      type Payload = TkitUtils.GetArgumentsType<Action>[1];
      const type = (TYPES[doSomething] = `${namespace}/${doSomething}`);
      reducersMap[type] = reducers[doSomething];
      actions[doSomething] = ((payload: Payload['payload']) =>
        createAction(type, payload)) as Actions[typeof doSomething];
      return actions;
    },
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    {} as Actions
  );
  const genSagas: any[] = [];
  const CustomEffects: CustomEffects = { ...sagaEffects, namespace, tPut, tCall };
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
        let saga = effects[doSomethingAsync];
        let effectOptions = defaultEffectOptions;
        if (Array.isArray(saga)) {
          effectOptions = { ...defaultEffectOptions, ...saga[1] };
          saga = saga[0];
        }
        const effect = effectWrapper(saga, CustomEffects);
        switch (effectOptions.type) {
          case 'throttle':
            genSagas.push(sagaEffects.throttle(effectOptions.ms || 100, type, effect));
            break;
          case 'takeEvery':
          case 'takeLatest':
            genSagas.push(sagaEffects[effectOptions.type](type, effect));
            break;
        }
      }
      return actions;
    }, actions);
  }
  return {
    state,
    actions,
    reducers: handleActions(reducersMap, state),
    *sagas() {
      yield sagaAll(genSagas);
    },
    TYPES: TYPES as ActionTypes,
    effects: { ...effects }
  };
}

export function effectWrapper<T extends BaseEffects, P, S>(saga: S, effects: T) {
  const { tPut: put } = effects;
  return function* wrapper(payload: P) {
    yield put(EFFECTS_START);
    try {
      if (typeof saga === 'function') {
        yield saga(effects, payload);
      }
    } catch (e) {
      yield put(EFFECTS_ERROR, e.message);
    }
    yield put(EFFECTS_END);
  };
}

export async function exeGenerator<A extends any[]>(
  effect: (...args: A) => IterableIterator<any>,
  ...args: A
) {
  const generator = effect(...args);
  let result = generator.next();
  while (!result.done) {
    await result.value;
    result = generator.next();
  }
}
