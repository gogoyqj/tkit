import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Async, {
  AsyncStatus,
  AsyncModalProps,
  doAsync,
  doAsyncConfirmed,
  doClearModal,
  NewAsyncParams
} from 'src/index';
import { FormFaker } from './Example';

describe('tkit-async/useAsync works ok', () => {
  let container: HTMLDivElement;
  const delay = () => new Promise(rs => setTimeout(rs, 0));

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null as any;
  });

  it('useAsync works ok', async () => {
    const effect = jest.fn((p: any) => Promise.resolve({ code: 0, result: 1 }));
    const effectFail = jest.fn((p: any) => Promise.resolve({ code: 10, result: 1 }));
    const loading = jest.fn((props: { status: AsyncStatus }) => null);
    const tips = jest.fn();
    const submit = jest.spyOn(FormFaker.prototype, 'submit');
    const catchCancel = jest.fn();
    const callback = jest.fn();
    const success = jest.fn();
    const fail = jest.fn();
    const params = {
      id: 1
    };
    const genParams = { age: 2 };
    const gen: NewAsyncParams<any>['paramsGenerator'] = p => ({
      ...genParams,
      ...(p.extraParams as any)
    });
    const paramsFun = jest.fn(gen);
    const modal = jest.fn((props: AsyncModalProps) => {
      return (
        <div className={props.className}>
          {props.content}
          <button className="ok" onClick={() => props.onOk && props.onOk()}></button>
          <button className="cancel" onClick={() => props.onCancel && props.onCancel()}></button>
        </div>
      );
    });
    const Cp = () => {
      return (
        <button
          className="async"
          onClick={() =>
            doAsync({
              formProps: {},
              modalProps: {
                className: 'm1'
              },
              callback,
              onSuccess: success,
              onError: fail,
              fetch: effect,
              paramsGenerator: paramsFun
            }).then(() => 0, catchCancel)
          }
          onMouseUp={() =>
            doAsync({
              formProps: {},
              callback,
              onSuccess: success,
              onError: fail,
              modalProps: {
                className: 'm2'
              },
              fetch: effect
            }).then(() => 0, catchCancel)
          }
          onMouseDown={() =>
            doAsyncConfirmed({
              fetch: effect,
              onSuccess: success,
              onError: fail,
              callback
            })
          }
          onKeyDown={() => {
            doAsyncConfirmed({
              fetch: effectFail,
              onSuccess: success,
              onError: fail,
              callback,
              params
            });
          }}
        ></button>
      );
    };
    act(() => {
      ReactDOM.render(
        <>
          <Cp />
          <Async modal={modal} loading={loading} tips={tips} form={FormFaker} />
        </>,
        container
      );
    });
    const button = container.querySelector('.async') as HTMLButtonElement;

    // onOK
    {
      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });
      await delay();
      const okButtons = container.querySelectorAll('.ok');
      expect(okButtons.length).toEqual(2);
      act(() => {
        okButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await delay();
      expect(submit).toBeCalled();
      submit.mockClear();

      expect(effect).toBeCalledWith({ ...FormFaker.fakeData, ...genParams });
      effect.mockClear();

      expect(paramsFun).toBeCalled();
      paramsFun.mockClear();

      expect(callback).toBeCalled();
      callback.mockClear();

      expect(success).toBeCalled();
      success.mockClear();

      expect(fail).toHaveBeenCalledTimes(0);
      fail.mockClear();

      expect(tips).toBeCalled();
      tips.mockClear();
    }

    // onCancel
    {
      act(() => {
        doClearModal();
      });
      let cancelButtons: NodeListOf<HTMLElementTagNameMap['button']> = container.querySelectorAll(
        '.cancel'
      );
      await new Promise(rs => {
        const checker = () => {
          if (cancelButtons.length > 1) {
            setTimeout(checker, 200);
          } else {
            rs();
          }
          cancelButtons = container.querySelectorAll('.cancel');
        };
        checker();
      });
      expect(cancelButtons.length).toEqual(1);
      act(() => {
        cancelButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await delay();

      expect(catchCancel).toBeCalled();
      expect(callback).toBeCalledTimes(0);
      callback.mockClear();
      catchCancel.mockClear();
    }

    // confirm OK
    {
      act(() => {
        button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });
      await delay();

      expect(loading).toBeCalled();
      loading.mockClear();

      expect(callback).toBeCalled();
      callback.mockClear();

      expect(success).toBeCalled();
      success.mockClear();

      expect(tips).toBeCalled();
      tips.mockClear();
    }

    // confirm Fail
    {
      act(() => {
        button.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
      });
      await delay();

      expect(loading).toBeCalled();
      loading.mockClear();

      expect(callback).toBeCalled();
      callback.mockClear();

      expect(fail).toBeCalled();
      fail.mockClear();

      expect(tips).toBeCalled();
      tips.mockClear();

      expect(effectFail).toBeCalledWith(params);
      effectFail.mockClear();
    }
  });
});
