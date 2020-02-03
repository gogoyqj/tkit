/**
 * @file: 测试
 * @author: yangqianjun
 * @Date: 2019-12-19 14:21:29
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-01-08 18:38:09
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useFetch, fetchReducer, DefaultFetchState, FetchType, IFetchState } from 'src';
import { TkitAbstractAjaxResult } from 'tkit-ajax';

describe('useFetch ok', () => {
  let container: HTMLDivElement;

  let state: IFetchState[] = [];
  const stateSatisfy = (satisfy: () => boolean) =>
    new Promise<void>((rs, rj) => {
      let count = 0;
      const timer = window.setInterval(() => {
        if (satisfy()) {
          rs();
          clearInterval(timer);
        }
        if (count > 50) {
          rj();
          clearInterval(timer);
        }
        count++;
      }, 100);
    });
  const Cp = ({
    fetch,
    lazy = false,
    type
  }: {
    type: FetchType;
    lazy?: boolean;
    fetch: (...args: any[]) => any;
  }) => {
    const { doFetch, error, fetching, result, res } = useFetch({
      fetch,
      paramsArr: [{ type }],
      lazy
    });
    state.push({
      error,
      fetching,
      result,
      res
    });
    return <button onClick={doFetch}>lazy</button>;
  };

  const cancel = jest.fn();

  // IMP: no async
  const fetch = jest.fn(({ type }: { type: FetchType }) => {
    const prom = new Promise<TkitAbstractAjaxResult<any>>(rs => {
      setTimeout(() => {
        if (!prom['cancelled']) {
          rs({
            code: type === FetchType.error ? 1 : 0,
            message: FetchType.error,
            result: []
          });
        }
      }, 300);
    });
    // IMP: 破坏社会和谐的手段
    prom['cancel'] = () => {
      prom['cancelled'] = true;
      cancel();
    };
    return prom;
  });
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null as any;
    state = [];
    cancel.mockClear();
  });
  it('fetchReducer ok', () => {
    const FetchState = {
      ...DefaultFetchState,
      result: {},
      error: 'error'
    };
    expect(
      fetchReducer(FetchState, {
        type: FetchType.cancel
      })
    ).toMatchSnapshot('cancel');

    expect(
      fetchReducer(FetchState, {
        type: FetchType.error,
        result: 'error'
      })
    ).toMatchSnapshot('error');

    expect(
      fetchReducer(FetchState, {
        type: FetchType.fetching
      })
    ).toMatchSnapshot('fetching');

    expect(
      fetchReducer(FetchState, {
        type: FetchType.result,
        result: []
      })
    ).toMatchSnapshot('result');
  });

  it('useFetch error ok', async () => {
    act(() => {
      ReactDOM.render(<Cp type={FetchType.error} fetch={fetch} />, container);
    });
    await stateSatisfy(() => !!state[state.length - 1].error);
    expect(state).toMatchSnapshot();
  });

  it('useFetch success ok', async () => {
    act(() => {
      ReactDOM.render(<Cp type={FetchType.result} fetch={fetch} />, container);
    });
    await stateSatisfy(() => !!state[state.length - 1].result);
    expect(state).toMatchSnapshot();
  });

  it('useFetch lazy ok', async () => {
    act(() => {
      ReactDOM.render(<Cp type={FetchType.result} lazy fetch={fetch} />, container);
    });
    expect(state).toMatchSnapshot('before fetching');
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await stateSatisfy(() => !!state[state.length - 1].result);
    expect(state).toMatchSnapshot();
  });

  it('useFetch cancel ok', async () => {
    act(() => {
      ReactDOM.render(<Cp type={FetchType.result} fetch={fetch} />, container);
    });
    expect(state).toMatchSnapshot('before fetching');
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(cancel).toBeCalledTimes(1);
    await stateSatisfy(() => !!state[state.length - 1].result);
    expect(state).toMatchSnapshot();
  });
});
