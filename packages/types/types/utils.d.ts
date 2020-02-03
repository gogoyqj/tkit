export namespace TkitUtils {
  /** 基础类型 */
  export type BasicFun = (...args: any[]) => any;
  /** 抽象异步函数 */
  export type AbstractAsyncFunction<R> = (...args: any[]) => Promise<R>;
  export interface ActionWithPayload<P> {
    type: string;
    payload: P;
  }

  /** 函数相关 - 获取返回类型 */
  export type GetReturnTypeOfFun<E> = E extends BasicFun ? ReturnType<E> : never;
  /** 函数相关 - 获取Promise返回类型 */
  export type GetReturnTypeOfAsyncFun<E> = GetPromiseResolved<GetReturnTypeOfFun<E>>;
  /** 函数相关 - GetReturnTypeOfFun for short */
  export type GetROF<E> = GetReturnTypeOfFun<E>;
  /** 函数相关 - GetReturnTypeOfAsyncFun for short */
  export type GetROA<E> = GetReturnTypeOfAsyncFun<E>;

  /** 函数相关 - 获取参数类型 */
  export type GetArgumentsType<T> = T extends (...args: infer A) => any ? A : never;
  /** 解决 overload 情况下参数类型问题，for tCall & tPut */
  export type GetArgumentsTypeForOverload<T> =
    | (T extends (one: infer ONE) => any ? [ONE] : [never])
    | (T extends (...args: infer MANY) => any ? MANY : [never]);
  /** 获取除第一个参数外其他参数的类型 */
  export type GetArgumentsTypeExcept1st<T> = T extends (a: any, ...args: infer A) => any
    ? A
    : never;

  /** Promise - 获取 Promise resolve 类型 */
  export type GetPromiseResolved<R> = R extends Promise<infer P> ? P : R;

  /** Model 相关 - 获取 saga effects 类型 */
  // @cc: 修复 model effects 为数组情况下，不能正确生成 action 类型的 bug
  export type GetModelEffect<A> = A extends any[] ? A[0] : A;

  /** 生成文档用 */
  export interface TkitUtils {
    /** 基础类型 */
    BasicFun: (...args: any[]) => any;

    /** 抽象异步函数 */
    AbstractAsyncFunction: <R>(...args: any[]) => Promise<R>;

    ActionWithPayload: ActionWithPayload;

    /** 函数相关 - 获取返回类型 */
    GetReturnTypeOfFun: GetReturnTypeOfFun;

    /** 函数相关 - 获取Promise返回类型 */
    GetReturnTypeOfAsyncFun: GetReturnTypeOfAsyncFun;

    /** 函数相关 - GetReturnTypeOfFun for short */
    GetROF: GetReturnTypeOfFun;

    /** 函数相关 - GetReturnTypeOfAsyncFun for short */
    GetROA: GetReturnTypeOfAsyncFun;

    /** 函数相关 - 获取参数类型 */
    GetArgumentsType: GetArgumentsType;
    /** 解决 overload 情况下参数类型问题，for tCall & tPut */

    /** 获取除第一个参数外其他参数的类型 */
    GetArgumentsTypeExcept1st: GetArgumentsTypeForOverload;

    /** Promise - 获取 Promise resolve 类型 */
    GetPromiseResolved: GetPromiseResolved;

    /** Model 相关 - 获取 saga effects 类型 */
    GetModelEffect: GetModelEffect;
  }
}
