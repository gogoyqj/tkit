import { call, put, select } from 'redux-saga/effects';

import { pagination } from '@src/index';

import {
  params,
  fetcher,
  selectPayload,
  pageData,
  pageParams,
  Data401,
  TestData
} from './paginationSamples/const';

const storeKey = 'test';

describe('utils/WrappedFetch work ok', () => {
  const {
    initialState,
    reducer,
    action,
    START,
    SELECTED,
    SUCCESS,
    FAILED,
    MODIFY,
    fetchData,
    selectParams,
    selectAction
  } = pagination(storeKey, params, fetcher, 'id', storeKey);

  it('wrapped ok', () => {
    expect(initialState).toHaveProperty(storeKey);
    expect(action({})).toHaveProperty('type', START);
    expect(selectAction(selectPayload)).toMatchObject({ type: SELECTED, payload: selectPayload });
    expect(selectParams({ [storeKey]: { [storeKey]: { params: 2 } } } as any)).toEqual(2);
  });

  it('saga ok', async () => {
    let generator = fetchData({ payload: { params }, type: '' });
    let next = generator.next();
    expect(next.value).toMatchObject(select(selectParams));
    next = generator.next(pageParams);
    expect(next.value).toMatchObject(call(fetcher, { ...pageParams, ...params }));
    next = generator.next(Data401);
    expect(next.value).toMatchObject(put({ type: FAILED, payload: Data401 }));
    generator = fetchData({ payload: { params }, type: '' });
    next = generator.next();
    next = generator.next(pageParams);
    expect(next.value).toMatchObject(call(fetcher, { ...pageParams, ...params }));
    next = generator.next(TestData);
    expect(next.value).toMatchObject(put({ type: SUCCESS, payload: { pageData: TestData } }));
  });

  it('reducer ok', () => {
    const store = {
      ...initialState
    };
    expect(store).toHaveProperty(storeKey);
    const loadingStore = reducer(store, { type: START, payload: { pageData: TestData } });
    expect(loadingStore[storeKey]).toHaveProperty('loading', true);
    const successStore = reducer(loadingStore, { type: SUCCESS, payload: { pageData: TestData } });
    expect(successStore[storeKey]).toHaveProperty('pageData', pageData);
    const selectedStore = reducer(successStore, {
      type: SELECTED,
      payload: { selectedRowKeys: [2, 5] }
    });
    expect(selectedStore[storeKey]).toHaveProperty('selectedRowKeys', [2]);
    const failedStore = reducer(selectedStore, { type: FAILED, payload: Data401 });
    expect(failedStore[storeKey]).toHaveProperty('fetchError', Data401);

    const custonReducer = jest.fn((list: typeof initialState['test']) => ({
      ...list,
      pageData: pageData.concat([{ id: 200, name: '' }])
    }));
    const newStore = reducer(store, { type: MODIFY, payload: custonReducer });
    expect(custonReducer).toBeCalled();
    expect(newStore[storeKey].pageData.find(({ id }) => id === 200)).toMatchObject({ id: 200 });
  });
});
