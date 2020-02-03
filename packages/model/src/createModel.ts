/**
 * @author: yangqianjun
 * @file: 类似 dva model 的 TypeScript 封装
 * @Date: 2019-11-19 16:14:12
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-01-06 18:24:59
 */

import { produce } from 'immer';
import * as sagaEffects from 'redux-saga/effects';
import { createAction, handleActions } from 'tkit-actions';
import { TkitUtils } from 'tkit-types';
import { EventCenter } from 'tkit-event';
import { IAsyncConfirmedParams } from 'tkit-async/lib/asyncModel';
// IMP: 解除循环依赖
import { ASYNC_EFFECT_EVENT_NAME } from 'tkit-async/lib/consts';

export * from 'redux-saga/effects';

export const { all: sagaAll, call: sagaCall, cancelled } = sagaEffects;

export const effects = sagaEffects;
/**
 * Redux Type 副作用开始
 */
export const EFFECTS_START = 'EFFECTS_START';
/**
 * Redux Type 副作用结束
 */
export const EFFECTS_END = 'EFFECTS_END';
/**
 * Redux Type 副作用错误
 */
export const EFFECTS_ERROR = 'EFFECTS_ERROR';
/**
 * Redux Type 副作用成功
 */
export const EFFECTS_SUCCESS = 'EFFECTS_SUCCESS';
/**
 * 副作用消息EventCenter事件
 */
export const EFFECTS_MSG = 'EFFECTS_MSG';

/**
 * Tkit Action
 * @property payload 参数
 */
export interface Tction<P> {
  payload: P;
}

/**
 * Tkit Basic Action
 */
export type AbstractAction = Tction<any>;

/**
 * 供推导同步Actions的Reducers
 */
export interface Reducers<M> {
  [doSomething: string]: <P extends AbstractAction>(state: Readonly<M>, action: P) => M;
}

export interface CMReducers<M> {
  // void | M 则兼容 Reducers
  [doSomething: string]: <P extends AbstractAction>(state: M, action: P) => void | M;
}

/**
 * redux和useReducer dispatch wrapper
 * @param put Dispatch
 */
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
 * 用以替代 redux-saga put 的 typed 的 tPut
 * @param effect model 或者 redux 创建的 action
 * @param args action 支持的参数
 * @cc: 当前版本，向下不兼容基于 redux-actions 创建的 action，只兼容 typesafe-action
 */
export function tPut<E extends (...args: []) => any>(effect: E | string | Tction<any>): any;
export function tPut<E extends (one: any) => any>(
  effect: E | string | Tction<any>,
  args: TkitUtils.GetArgumentsType<E>[0] extends undefined
    ? E extends string
      ? any
      : never
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
 * 用以替代 redux-saga call 的 typed tCall
 * ```
 *  // 解决由于使用了 yield 造成 data 类型丢失的问题, TkitUtils.GetROA for short
 *  const data: TkitUtils.GetReturnTypeOfAsyncFun<typeof effect> = yield tCall(effect, args)
 * ``
 * @param effect effect 函数，如 service
 * @param args effect 函数的参数
 */
export function tCall<E extends () => any>(effect: E): Iterator<ReturnType<E>>;
export function tCall<E extends (one: any) => any>(
  effect: E,
  args: TkitUtils.GetArgumentsType<E>[0] extends undefined
    ? never
    : TkitUtils.GetArgumentsType<E>[0]
): Iterator<ReturnType<E>>;
export function tCall<E extends (...args: any[]) => any>(
  effect: E,
  ...args: TkitUtils.GetArgumentsType<E>
): Iterator<ReturnType<E>>;
export function tCall<E extends (...args: any[]) => any>(
  effect: E,
  ...args: any[]
): Iterator<ReturnType<E>> {
  // 不可以: sagaCall(effect, ...args)
  return sagaCall.apply(null, [effect, ...args]);
}
export interface BaseEffects {
  namespace: string;
  tPut: typeof tPut;
  tCall: typeof tCall;
}
export type CustomEffects = typeof sagaEffects & BaseEffects;

type AsyncEffectWithPayload = <P extends AbstractAction>(
  saga: CustomEffects,
  action: P
) => Promise<any>;
type MixAsyncEffectWithPayload = [
  <P extends AbstractAction>(saga: CustomEffects, action: P) => Promise<any>,
  Omit<EffectOptions, 'type' | 'ms'>
];
type EffectWithPayload = <P extends AbstractAction>(saga: CustomEffects, action: P) => Iterator<{}>;
type EffectType = 'takeEvery' | 'takeLatest' | 'throttle';
/**
 * Model Effects配置参数
 * @property type 类型
 * @property [ms] type为“throttle”下节流毫秒数
 * @property [loading] 是否要求显示全局loading效果
 */
export interface EffectOptions {
  /**
   * 类型
   */
  type: EffectType;
  /**
   * type为“throttle”下节流毫秒数
   */
  ms?: number;
  /**
   * 是否要求显示全局loading效果
   */
  loading?: boolean;
  /**
   * 是否局部副作用
   */
  local?: boolean;
  /**
   * 屏蔽交互效果，设置为true，则不会广播事件
   */
  silent?: boolean;
}
export type MixWithPayload = [EffectWithPayload, EffectOptions];
/**
 * 副作用，推导为异步Actions
 */
export interface Effects {
  [doSomethingAsync: string]:
    | MixWithPayload
    | EffectWithPayload
    | AsyncEffectWithPayload
    | MixAsyncEffectWithPayload;
}

export interface LocalEffects {
  [doSomethingAsync: string]: AsyncEffectWithPayload | MixAsyncEffectWithPayload;
}

const defaultEffectOptions: EffectOptions = {
  type: 'takeEvery',
  ms: 100
};

// effects dependences
export type Sagas = ((...args: any[]) => any)[];

export const enum ModernType {
  /** redux */
  ReduxModern = 0,
  /** useModel */
  HookModern = 1
}

/**
 * Model工厂
 * @param model
 * @param model.namespace 命令空间
 * @param model.state 初始状态
 * @param model.reducers 推导reducers和同步actions
 * @param model.effects 副作用，推导异步actions
 */
export default function createModel<M, R extends Reducers<M>, E extends Effects>(model: {
  /** 命名空间 */
  namespace: string;
  /**  初始状态 */
  state: M;
  reducers: R;
  effects?: E;
  /** modern 模式，引入 immer，解决 namespace 的问题 */
  m?: ModernType;
}) {
  type ReducerName = keyof R;
  type EffectName = keyof E;
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
  // FIXME: 泛型则丢类型
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
  const { namespace, state, reducers, effects, m: modern } = model;
  const reducersMap: any = {};
  const TYPES: any = {};
  let actions = Object.keys(reducers).reduce(
    (actions, doSomething: ReducerName) => {
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
        const effect = effectWrapper(saga, CustomEffects, type, effectOptions);
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
    effects: { ...effects },
    namespace,
    __model: model
  };
}

const fakeEffectRes = { code: 0 };

export function effectWrapper<T extends BaseEffects, A, S>(
  effect: S,
  effects: T,
  effectName: string,
  EffectOptions?: EffectOptions
) {
  const { tPut: put } = effects;
  /**
   * 默认不展示loading
   */
  const loading = (EffectOptions && EffectOptions.loading) || false;
  const local = (EffectOptions && EffectOptions.local) || false;
  const silent = EffectOptions && EffectOptions.silent;
  /** 支持并发 */
  const effectFactory = () => {
    let rs: (...args: any) => any = () => 0;
    const res: {
      code?: number;
      message?: React.ReactNode;
    } = {
      code: 0,
      message: false
    };
    const getMsg = () => typeof res.message !== 'object' && res.message;
    let interactEffect: Function = rs;
    // 自动模拟 loading & 成功错误信息效果
    if (silent !== true) {
      interactEffect = () => {
        res.code = 0;
        res.message = false;
        // IMP: 有些Effects可能是同步的，所以对rs的赋值必须是同步，而不是在fetch被调用的时候
        const prom = new Promise(resolve => {
          // IMP: fakeEffect must be successful // 我有点记不得这是为啥了
          // loading 交互效果由 prom mock 出来，在真正的 fetch effect 执行完成后 resolve
          // FIX: 如果恒返回 fakeEffectRes，那么错误信息就显示吧出来
          rs = r => resolve(r || fakeEffectRes);
        });
        const asyncPayload: IAsyncConfirmedParams<any> = {
          fetch: () => prom,
          errorMsg: getMsg,
          successMsg: getMsg,
          effectName,
          indicator: loading === false ? loading : undefined,
          channel: 'tkit-model/effect'
        };
        EventCenter.emit(ASYNC_EFFECT_EVENT_NAME, {
          type: 'doAsyncConfirmed',
          payload: asyncPayload
        });
      };
    }
    return {
      getRes: () => res,
      getResolver: () => rs,
      getEffect: () => interactEffect
    };
  };
  /**
   * 局部Model不再使用gerator
   */
  return local
    ? async (action: A) => {
        await put({ type: EFFECTS_START, payload: { effectName } } as any);
        const { getResolver, getRes, getEffect } = effectFactory();
        getEffect()();
        const res = getRes();
        try {
          if (typeof effect === 'function') {
            res.message = (await effect(effects, action)) || false;
          }
        } catch (e) {
          res.code = 10100;
          res.message = e && e['message'] ? e['message'] : e;
          await put({ type: EFFECTS_ERROR, payload: { effectName } } as any);
        }
        await put({ type: EFFECTS_END, payload: { effectName } } as any);
        // 隐藏 loading
        getResolver()(res);
      }
    : function* wrapper(action: A) {
        yield put({ type: EFFECTS_START, payload: { effectName } } as any);
        const { getResolver, getRes, getEffect } = effectFactory();
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
}

// IMP: 移除副作用执行器
// export async function exeGenerator<A extends any[]>(
//   effect: (...args: A) => IterableIterator<any>,
//   ...args: A
// ) {
//   const generator = effect.apply(null, args);
//   let result = generator.next();
//   while (!result.done) {
//     try {
//       const res = await result.value;
//       result = generator.next(res);
//     } catch (e) {
//       return generator.throw(e);
//     }
//   }
//   return generator.value;
// }
