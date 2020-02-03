import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useModel, bindDispatchToAction } from 'src/useModel';
import { UserModel, clearState, remoteState } from './useModelSamples/testLocalModelOK';
import { UserMMModel } from './useModelSamples/testMMOK';

describe('utils/*Model work ok', () => {
  let container: HTMLDivElement;
  const renameState = { username: 'yqj' };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null as any;
  });

  it('useModel async/sync actions work ok', async () => {
    const effect = jest.fn();
    const Cp = () => {
      const [store, localActions] = useModel(UserModel);
      useEffect(() => {
        effect(store);
      }, [store]);
      return (
        <button
          onClick={() => localActions.doFetchName({ time: 2 })}
          onFocus={() => localActions.doRename(renameState)}
          onBlur={() => localActions.doClear()}
        >
          {store.username}
        </button>
      );
    };
    act(() => {
      ReactDOM.render(<Cp />, container);
    });

    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button).toHaveProperty('tagName');
    expect(effect).toBeCalledWith(UserModel.state);
    expect(button.innerHTML).toEqual('');

    effect.mockClear();
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // @cc: 预估的 10ms delay，直到 effect 被调用
    await new Promise(rs => setTimeout(rs, 10));
    expect(effect).toBeCalledTimes(1);
    expect(effect).toBeCalledWith(remoteState);
    expect(button.innerHTML).toEqual(remoteState.username);

    effect.mockClear();
    act(() => {
      button.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    });
    expect(effect).toBeCalledWith(renameState);
    expect(button.innerHTML).toEqual(renameState.username);

    effect.mockClear();
    act(() => {
      button.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    });
    expect(effect).toBeCalledWith({ ...renameState, ...clearState });
    expect(button.innerHTML).toEqual(clearState.username);
  });

  it('MM async/sync actions work ok', async () => {
    const effect = jest.fn();
    const fetchName = 2;
    const remoteState = { username: `${fetchName}` };
    const Cp = () => {
      const [store, localActions] = useModel(UserMMModel);
      useEffect(() => {
        effect(store);
      }, [store]);
      return (
        <button
          onClick={() => localActions.doFetchName({ time: fetchName })}
          onFocus={() => localActions.doRename(renameState)}
          onBlur={() => localActions.doClear()}
        >
          {store.username}
        </button>
      );
    };
    act(() => {
      ReactDOM.render(<Cp />, container);
    });

    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button).toHaveProperty('tagName');
    expect(effect).toBeCalledWith(UserMMModel.state);
    expect(button.innerHTML).toEqual('');

    effect.mockClear();
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // @cc: 预估的 10ms delay，直到 effect 被调用
    await new Promise(rs => setTimeout(rs, 10));
    expect(effect).toBeCalledTimes(1);
    expect(effect).toBeCalledWith(remoteState);
    expect(button.innerHTML).toEqual(remoteState.username);

    effect.mockClear();
    act(() => {
      button.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    });
    expect(effect).toBeCalledWith(renameState);
    expect(button.innerHTML).toEqual(renameState.username);

    effect.mockClear();
    act(() => {
      button.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    });
    expect(effect).toBeCalledWith({ ...renameState, ...clearState });
    expect(button.innerHTML).toEqual(clearState.username);
  });

  it('createModel async/sync actions work ok', async () => {
    const dispacth = jest.fn();

    const actions = bindDispatchToAction(UserModel.actions, dispacth, UserModel);

    actions.doRename(renameState);
    expect(dispacth).toBeCalledTimes(1);
    expect(
      UserModel.reducers(UserModel.state, {
        type: UserModel.TYPES.doRename,
        payload: renameState
      })
    ).toEqual(renameState);

    dispacth.mockClear();
    actions.doFetchName({ time: 2 });
    expect(dispacth).toBeCalledTimes(2);
    // @cc: 请勿修改 delay 时间，单元测试使用
    await new Promise(rs => setTimeout(rs, 10));
    // @cc: EFFECTS_START, END
    expect(dispacth).toBeCalledTimes(4);

    dispacth.mockClear();
    actions.doClear();
    expect(dispacth).toBeCalledTimes(1);
    expect(
      UserModel.reducers(UserModel.state, { type: UserModel.TYPES.doClear, payload: clearState })
    ).toEqual(clearState);
  });
});
