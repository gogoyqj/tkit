export namespace TkitUtils {
  /**
   * @description 基础类型
   */
  export type BasicFun = (...args: any[]) => any;
  export type AbstractAsyncFunction<R> = (...args: any[]) => Promise<R>;
  export interface ActionWithPayload<P> {
    type: string;
    payload: P;
  }

  /**
   * @description 函数相关 - 获取返回类型
   */
  export type GetReturnTypeOfFun<E> = E extends BasicFun ? ReturnType<E> : never;
  export type GetReturnTypeOfAsyncFun<E> = GetPromiseResolved<GetReturnTypeOfFun<E>>;
  export type GetROF<E> = GetReturnTypeOfFun<E>;
  export type GetROA<E> = GetReturnTypeOfAsyncFun<E>;

  /**
   * @description 函数相关 - 获取参数类型
   */
  export type GetArgumentsType<T> = T extends (...args: infer A) => any ? A : never;
  // @cc: 解决 overload 情况下参数类型问题，for tCall & tPut
  export type GetArgumentsTypeForOverload<T> =
    | (T extends (one: infer ONE) => any ? [ONE] : [never])
    | (T extends (...args: infer MANY) => any ? MANY : [never]);
  export type GetArgumentsTypeExcept1st<T> = T extends (a: any, ...args: infer A) => any
    ? A
    : never;

  /**
   * @description Promise - 获取 Promise resolve 类型
   */
  export type GetPromiseResolved<R> = R extends Promise<infer P> ? P : R;

  /**
   * @description Model 相关 - 获取 saga effects 类型
   */
  // @cc: 修复 model effects 为数组情况下，不能正确生成 action 类型的 bug
  export type GetModelEffect<A> = A extends any[] ? A[0] : A;
}
