import { put, call, select, takeLatest, all } from 'redux-saga/effects';
import { createAction, handleActions, Action } from 'tkit-actions';
import { TkitAjaxFunction } from 'tkit-ajax';
import { TkitUtils } from 'tkit-types';

export interface TkitPagenationParams {
  /**
   * 当前页码，同pageNum
   */
  current: number;
  /**
   * 当前页码，同current
   */
  pageNum: number;
  /**
   * 每页显示条数
   */
  pageSize: number;
  // 非标准参数
  [str: string]: any;
  [num: number]: any;
}
export interface TkitPagenationStateBase<D, P extends Partial<TkitPagenationParams>> {
  /**
   * 当前页数据列表
   */
  pageData: D[];
  /**
   * 总条数
   */
  total: number;
  /**
   * 适配到antd Table组件的rowKey，默认是id
   */
  rowKey?: string | number;
  /**
   * 适配到antd Table组件的当前选中的rowKey
   */
  selectedRowKeys: (string | number)[];
  /**
   * 是否正在加载，同isfetch
   */
  loading: boolean; //  for antd
  /**
   * 是否正在加载，同loading
   */
  isfetch: boolean;
  /**
   * 错误信息
   */
  fetchError:
    | boolean
    | {
        code?: number;
        message?: string | number | any;
      };
  /**
   * 参数
   */
  params: P;
}

export type TkitGetListItemType<L> = L extends { result: { list: (infer I)[] } } ? I : never;
export type TkitListParams = Partial<TkitPagenationParams>;
const DEFAULY_ROW_KEY = 'id';

/**
 * 翻页组件
 * @param key ReduxStore Key
 * @param params 自定义扩展参数
 * @param fetch 拉取数据的函数
 * @param [rowKey] 适配antd Table组件的rowKey，默认为id
 * @param [feature] 所属模板项目的模块
 */
export function pagination<F extends TkitAjaxFunction, K extends string, P extends TkitListParams>(
  key: K,
  params: P,
  fetch: F,
  rowKey: string = DEFAULY_ROW_KEY,
  feature?: string
) {
  // cc:可以通过设置 "feature/key" 或者通过第5个参数来设置 feature
  if (typeof feature === 'undefined') {
    feature = key.split('/')[0];
    // @ts-ignore
    // @ts-nocheck
    key = key.split('/')[1];
  }
  if (!feature) {
    throw Error(
      `storeKey must be 'featureName/storeName' like, but received ${key}, or pass feature as 5th argument`
    );
  }
  const storeKey = `${feature}/${key}`;
  type ListResult = TkitUtils.GetPromiseResolved<ReturnType<F>>;
  type ListItem = TkitGetListItemType<ListResult>;
  type MergedParams = Partial<P> & TkitListParams;
  type List = TkitPagenationStateBase<ListItem, MergedParams>;
  type Store = { [k in K]: List };
  // eslint-disable-next-line @typescript-eslint/prefer-interface
  type SelectPayload = {
    selectedRowKeys?: List['selectedRowKeys'];
    rowKey?: string;
  };
  const initialList: List = {
    pageData: [],
    total: 0,
    params: {
      current: 1,
      pageNum: 1,
      pageSize: 10,
      ...params
    },
    rowKey, // 默认是 id
    selectedRowKeys: [], // 列表选中
    loading: false,
    isfetch: false, // 加载loader显示与隐藏
    fetchError: false // 失败后弹窗
  };
  const initialState: Store = [key].reduce(
    (state, k) => {
      state[k] = initialList;
      return state;
    },
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    {} as Store
  );
  const CHANGE_PAGE = `${storeKey}/CHANGE_PAGE`;
  const CHANGE_PAGE_SELECTED = `${storeKey}/CHANGE_PAGE_SELECTED`;
  const CHANGE_PAGE_SUCCESS = CHANGE_PAGE + '_SUCCESS';
  const CHANGE_PAGE_FAILED = CHANGE_PAGE + '_FAILED';
  const CHANGE_PAGE_MODIFY = CHANGE_PAGE + '_MODIFY';
  const doChangePage = (params: Partial<List['params']>) =>
    createAction(CHANGE_PAGE, {
      params
    });
  const doSelectedRowKeys = (payload: SelectPayload) => createAction(CHANGE_PAGE_SELECTED, payload);
  const doModifyPageData = (reducer: (list: List) => List) =>
    createAction(CHANGE_PAGE_MODIFY, reducer);

  const selectParams = (store: {
    [f: string]: {
      [k: string]: List;
    };
  }) => store[`${feature}`][key].params;

  const emptyArr: [] = [];

  const selectReducer = (state: Store, action: Action<SelectPayload>): Store => {
    const {
      [key]: { pageData, selectedRowKeys: listRowSelectKeys, rowKey: listRowKey = DEFAULY_ROW_KEY }
    } = state;
    const { selectedRowKeys = listRowSelectKeys, rowKey = listRowKey } = action.payload;
    const existKeys: null | { [str: string]: '' } = Array.isArray(pageData)
      ? pageData.reduce((mp, cur) => {
          mp[cur[rowKey]] = '';
          return mp;
        }, {})
      : null;
    return {
      ...state,
      [key]: {
        ...state[key],
        selectedRowKeys: existKeys ? selectedRowKeys.filter(id => id in existKeys) : emptyArr
      }
    };
  };
  // cc: 目前只支持接收一个参数的拉取数据函数
  function* fetchData(
    action: Action<{ params: TkitUtils.GetArgumentsType<F>[0] }>
  ): Iterator<any, any, any> {
    let res;
    try {
      const params = action.payload ? action.payload.params : {};
      const { current, pageNum, pageSize } = yield select(selectParams);
      // merge 标准参数
      const newParams = { current, pageNum, pageSize, ...params };
      newParams.pageNum = Number(newParams.pageNum);
      newParams.pageSize = Number(newParams.pageSize);
      res = yield call(fetch, newParams); // 请求数据
      res = {
        ...(res && res.code ? res : { pageData: res }),
        params: newParams
      };
    } catch (err) {
      res = {
        code: 10002,
        message: err.message
      };
    }
    yield put({
      type: res && res.code ? CHANGE_PAGE_FAILED : CHANGE_PAGE_SUCCESS,
      payload: res
    });
  }

  function* sagaChangePage() {
    yield all([
      takeLatest(CHANGE_PAGE_SUCCESS, () =>
        put({ type: CHANGE_PAGE_SELECTED, payload: { selectedRowKeys: emptyArr } })
      ),
      takeLatest(CHANGE_PAGE, fetchData)
    ]);
  }

  const applyChangePage = handleActions<Store, Store | any>(
    {
      [CHANGE_PAGE_SELECTED]: selectReducer,
      [CHANGE_PAGE_MODIFY]: (state: Store, action: Action<(list: List) => List>): Store => {
        const { payload: reducer } = action;
        const list = state[key];
        return {
          ...state,
          [key]: {
            ...(typeof reducer === 'function' ? reducer(list) : list)
          }
        };
      },
      [CHANGE_PAGE]: (state: Store, action: Action<TkitListParams>): Store => {
        return {
          ...state,
          [key]: {
            ...state[key],
            pageData: [],
            isfetch: true,
            loading: true
          }
        };
      },
      [CHANGE_PAGE_SUCCESS]: <
        S extends { total?: number; pageData?: List | ListResult; params: TkitListParams }
      >(
        state: Store,
        action: Action<S>
      ): Store => {
        // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
        const { payload = {} as S } = action;
        let { total = 0 } = payload;
        const { pageData } = payload;
        let pageDataArr = pageData;
        let { pageSize } = state[key].params;
        if (pageData && !Array.isArray(pageData)) {
          const { result } = pageData as ListResult;
          if (result) {
            if (Array.isArray(result.list)) {
              pageDataArr = result.list;
            }
            total = result.total || total;
            pageSize = result.pageSize || pageSize;
          }
        }
        const newStore = {
          ...state[key],
          total,
          pageData: pageDataArr || emptyArr,
          fetchError: false,
          isfetch: false,
          loading: false,
          params: {
            pageNum: (payload.params && payload.params.pageNum) || state[key].params.pageNum,
            pageSize
          }
        };
        (newStore.params as TkitPagenationParams).current = newStore.params.pageNum = Number(
          newStore.params.pageNum
        );
        newStore.params.pageSize = Number(pageSize);
        return {
          ...state,
          [key]: newStore
        };
      },
      [CHANGE_PAGE_FAILED]: (
        state: Store,
        action: Action<{ code: number; message: string }>
      ): Store => {
        const newStore = {
          ...state[key],
          fetchError: action.payload,
          isfetch: false,
          loading: false,
          total: 0,
          params: {
            pageNum: 0,
            pageSize: state[key].params.pageSize
          }
        };
        return {
          ...state,
          [key]: newStore
        };
      }
    },
    initialState
  );

  return {
    initialState,
    store: initialState[key],
    fetchData,
    action: doChangePage,
    modifyDataAction: doModifyPageData,
    selectAction: doSelectedRowKeys,
    reducer: applyChangePage,
    selectReducer,
    saga: sagaChangePage,
    selectParams,
    START: CHANGE_PAGE,
    SUCCESS: CHANGE_PAGE_SUCCESS,
    SELECTED: CHANGE_PAGE_SELECTED,
    FAILED: CHANGE_PAGE_FAILED,
    MODIFY: CHANGE_PAGE_MODIFY
  };
}

export default pagination;
