import { START, SUCCESS, initialState, reducer, action, selectAction } from './const';

//@cc: 报错，请勿修改，单元测试使用
export const TestSTART: number = START;
export const TestSUCCESS: boolean = SUCCESS;

const userList2 = initialState.userList2;
const userList = initialState.userList;
export const { loading, pageData, selectedRowKeys, total2, fetchError, params } = userList;

export const TestPageData: typeof pageData = [{ id: '2', name: 2 }];
export const TestSelectedRowKeys: typeof selectedRowKeys = [true];
export const TestParams: typeof params = { current: 1, pageNum: '1', pageSize: 1 };

export const TestAction = () => action({ pageNum: 2, pageSize: 10, kw: 2 });
export const TestSelectAction = () =>
  selectAction({
    selectedRowKeys: ['1'],
    rowKey: 1
  });

export const newStore = reducer({ ...initialState }, (<S>(s: S) => s) as any);
type NewStoreData2 = typeof newStore['userList2'];
type NewStoreData = typeof newStore['userList'];
export const newParams: NewStoreData['params'] = { kw: 2 };
export const newPageData: NewStoreData['pageData'] = [{ id: '2', name: 2 }];
