import { asyncModel, IAsyncState } from '@src/asyncModel';
import { CustomEffects } from 'tkit-model';

const {
  __model: {
    reducers: { doAsyncStart, doAsyncConfirmedStart, doAsyncEnd },
    effects
  }
} = asyncModel;

function getInitialState(): IAsyncState {
  return {
    asyncStatus: []
  };
}

async function loadData() {
  return {
    code: 0,
    result: { id: 0 }
  };
}

async function loadDataError() {
  return {
    code: 10,
    result: { id: 0 }
  };
}

describe('tkit-async/asyncModel works ok', () => {
  it('reducers reducer should work ok', () => {
    const state = getInitialState();
    let newState = doAsyncStart(state, {
      payload: {
        ASYNC_ID: 1
      }
    });
    expect(newState.asyncStatus).toHaveLength(1);
    expect(newState.asyncStatus[0].confirmed).toEqual(false);
    expect(newState.asyncStatus[0].isFetch).toEqual(false);
    expect(newState).toMatchSnapshot('doAsyncStart');

    newState = doAsyncConfirmedStart(newState, {
      payload: {
        ASYNC_ID: 1
      }
    });
    expect(newState.asyncStatus).toHaveLength(1);
    expect(newState.asyncStatus[0].confirmed).toEqual(true);
    expect(newState.asyncStatus[0].isFetch).toEqual(true);
    expect(newState).toMatchSnapshot('doAsyncConfirmedStart');

    newState = doAsyncConfirmedStart(newState, {
      payload: {
        ASYNC_ID: 2
      }
    });
    expect(newState.asyncStatus).toHaveLength(2);
    expect(newState.asyncStatus[1].confirmed).toEqual(true);
    expect(newState.asyncStatus[1].isFetch).toEqual(true);
    expect(newState).toMatchSnapshot('doAsyncConfirmedStart 2');

    // @IMP: 出错的情况不移除
    newState = doAsyncEnd(newState, {
      payload: {
        ASYNC_ID: 2,
        isSuccess: false
      }
    });
    expect(newState.asyncStatus).toHaveLength(2);
    expect(newState.asyncStatus[1].confirmed).toEqual(false);
    expect(newState.asyncStatus[1].isFetch).toEqual(false);
    expect(newState).toMatchSnapshot('doAsyncEnd');

    newState = doAsyncEnd(newState, {
      payload: {
        ASYNC_ID: 2,
        isSuccess: true
      }
    });
    expect(newState.asyncStatus).toHaveLength(1);
    expect(newState.asyncStatus[0].confirmed).toEqual(true);
    expect(newState.asyncStatus[0].isFetch).toEqual(true);
    expect(newState).toMatchSnapshot('doAsyncEnd 2');

    // 清空
    newState = doAsyncEnd(newState, {
      payload: {
        ASYNC_ID: 1,
        isSuccess: true
      }
    });
    expect(newState.asyncStatus).toHaveLength(0);
  });
  it('effects should work ok', async () => {
    // @IMP: cheater
    if (effects) {
      const { doAsync, doAsyncCancel, doAsyncConfirmed } = effects;
      let payloads: any[] = [];
      const tPut = jest.fn((action: any, payload: any) => {
        payload = { ...payload };
        if (payload.fetch) {
          // @IMP: 避免 jest 本身的变化造成 snapshot 变化
          payload.fetch = 'function';
        }
        payloads.push(payload);
      });
      const eff: CustomEffects = { tPut } as any;
      await doAsync(eff, {
        payload: {
          fetch: loadData
        }
      });
      expect(tPut).toBeCalled();
      expect(payloads).toMatchSnapshot('doAsync');

      tPut.mockClear();
      payloads = [];
      let spyLoadData = jest.fn((id: number) => loadData());

      await doAsyncConfirmed(eff, {
        payload: {
          fetch: spyLoadData,
          params: 1
        }
      });
      expect(tPut).toBeCalled();
      expect(payloads).toMatchSnapshot('doAsyncConfirmed params');
      tPut.mockClear();
      payloads = [];
      expect(spyLoadData).toBeCalledWith(1);
      spyLoadData.mockClear();

      await doAsyncConfirmed(eff, {
        payload: {
          fetch: spyLoadData,
          paramsGenerator: () => [1]
        }
      });
      expect(tPut).toBeCalled();
      expect(payloads).toMatchSnapshot('doAsyncConfirmed paramsGenerator');
      tPut.mockClear();
      payloads = [];
      expect(spyLoadData).toBeCalledWith(1);
      spyLoadData.mockClear();

      spyLoadData = jest.fn((id: number) => Promise.reject('error'));
      await doAsyncConfirmed(eff, {
        payload: {
          fetch: spyLoadData,
          paramsGenerator: () => [1]
        }
      });
      expect(tPut).toBeCalled();
      expect(payloads).toMatchSnapshot('doAsyncConfirmed paramsGenerator error');
      tPut.mockClear();
      payloads = [];
      expect(spyLoadData).toBeCalledWith(1);
      spyLoadData.mockClear();

      await doAsyncCancel(eff, {
        payload: 1
      });
      expect(tPut).toBeCalled();
      expect(payloads).toMatchSnapshot('doAsyncCancel');
      tPut.mockClear();
      payloads = [];
      tPut.mockClear();
      payloads = [];
    }
  });
});
