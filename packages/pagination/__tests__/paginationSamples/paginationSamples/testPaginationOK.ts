import { START, SUCCESS, initialState, reducer, action, selectAction } from './const';

// 正确
export const TestSTART: string = START;
export const TestSUCCESS: string = SUCCESS;

const userList = initialState.userList;
export const { loading, pageData, selectedRowKeys, total, fetchError, params } = userList;

export const TestPageData: typeof pageData = [{ id: 2, name: 'name' }];
export const TestSelectedRowKeys: typeof selectedRowKeys = ['1'];
export const TestParams: typeof params = { current: 1, pageNum: 1, pageSize: 1 };

export const TestAction = () => action({ pageNum: 2, pageSize: 10, kw: '' });
export const TestSelectAction = () =>
  selectAction({
    selectedRowKeys: ['1'],
    rowKey: 'id'
  });

export const newStore = reducer({ ...initialState }, (<S>(s: S) => s) as any);
type NewStoreData = typeof newStore['userList'];
export const newParams: NewStoreData['params'] = { kw: '2' };
export const newPageData: NewStoreData['pageData'] = [{ id: 2, name: '' }];
