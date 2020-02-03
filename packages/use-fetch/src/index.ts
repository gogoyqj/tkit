/**
 * @file: 拉取数据 hooks
 * @author: yangqianjun
 * @Date: 2019-12-16 18:33:46
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-01-08 18:38:22
 */
import { useEffect, useRef, useReducer, useCallback } from 'react';
import { TkitUtils } from 'tkit-types';
import { AjaxErrorCode, TkitAjaxFunction, TkitAjaxResult, AjaxCancelMessage } from 'tkit-ajax';

export interface IFetchState {
  /** 是否正在加载 */
  fetching: boolean;
  /** 错误信息 */
  error: null | string;
  /** 响应主体 */
  result: null | any;
  /** response 3.1.5 支持 */
  res?: null | any;
}

/** 状态 */
export enum FetchType {
  fetching = 'fetching',
  /** cancel */
  cancel = 'cancel',
  /** 出错 */
  error = 'error',
  /** 成功 */
  result = 'result'
}

export function fetchReducer<R>(
  state: IFetchState,
  action: {
    type: FetchType;
    /** 标准化之后的响应主体 */
    result?: R | string | null;
    res?: null | any;
  }
): IFetchState {
  const { type, result = null, res } = action;
  switch (type) {
    // 不清空数据
    case FetchType.error:
      return {
        ...state,
        fetching: false,
        res,
        error: result as string
      };
    case FetchType.result:
      return {
        ...state,
        error: null,
        fetching: false,
        res,
        result
      };
    // 不清空数据和错误
    case FetchType.fetching:
      return state.fetching
        ? state
        : {
            ...state,
            fetching: true
          };
    case FetchType.cancel:
      return state.fetching
        ? {
            ...state,
            fetching: false
          }
        : state;
    default:
      return state;
  }
}

export interface IFetchConfig<A extends TkitAjaxFunction> {
  /** 异步函数 */
  fetch: A;
  /** fetch 的参数， 必须是数组 */
  paramsArr: TkitUtils.GetArgumentsType<A>;
  /** 是否不自动拉取，默认 false */
  lazy?: boolean;
}

export const DefaultFetchState: IFetchState = {
  fetching: false,
  result: null,
  res: null,
  error: null
};

export function useFetch<A extends TkitAjaxFunction>(
  conf: IFetchConfig<A>
): Omit<IFetchState, 'result'> & {
  /** 标准响应值主体 */
  res?: null | TkitUtils.GetROA<A>;
  /** 响应主体 */
  result: null | TkitUtils.GetROA<A>['result'];
  /** if conf.lazy, 手动拉取数据，可传传递参数 */
  doFetch: (...args: TkitUtils.GetArgumentsType<A>) => ReturnType<A>;
} {
  const { fetch, paramsArr, lazy = false } = conf;
  const cancelLastFetch = useRef<(reason: string) => void>();
  const [{ result, fetching, error, res }, dispath] = useReducer(fetchReducer, DefaultFetchState);
  // IMP: 避免发起重复请求
  const doFetch = useCallback(
    (...args: TkitUtils.GetArgumentsType<A>) => {
      // start
      dispath({ type: FetchType.fetching });
      // auto cancel
      cancelLastFetch.current && cancelLastFetch.current(AjaxCancelMessage);
      // eslint-disable-next-line prefer-spread
      const prom = fetch.apply(null, args);
      const cancel = prom['cancel'];
      if (cancel) {
        cancelLastFetch.current = cancel;
      }
      return prom
        .then(
          (res: TkitAjaxResult) => res,
          (e: Error): TkitAjaxResult => ({
            code: AjaxErrorCode,
            message: (e && e.message) || e.toString(),
            result: null
          })
        )
        .then((res: TkitAjaxResult) => {
          const { message, code, result } = res;
          // IMP: only itself
          if (cancelLastFetch.current === cancel) {
            cancelLastFetch.current = undefined;
          }
          const update = () => {
            if (code !== 0) {
              dispath({ type: FetchType.error, result: message, res });
            } else {
              dispath({ type: FetchType.result, result, res });
            }
          };
          // IMP: for react test
          if (process.env.NODE_ENV === 'test') {
            require('react-dom/test-utils').act(() => {
              update();
            });
          } else {
            update();
          }
          return res;
        });
    },
    [fetch]
  );

  const paramsArrString = JSON.stringify(paramsArr);

  // do fetch
  useEffect(() => {
    if (lazy !== true) {
      // eslint-disable-next-line prefer-spread
      doFetch.apply(null, JSON.parse(paramsArrString));
    }
  }, [doFetch, lazy, paramsArrString]);

  return {
    result,
    fetching,
    error,
    doFetch,
    res
  };
}
