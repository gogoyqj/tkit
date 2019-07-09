import { pagination } from '@src/index';

export const pageData = [{ id: 2, name: '' }, { id: 3, name: 'name' }];
export const TestData = { code: 0, result: { list: pageData } };
export const Data401 = { code: 401, message: 'OK' };
export const params = { a: 2, b: 1 };
export const pageParams = { current: 1 };
export const selectPayload = { selectedRowKeys: [2], rowKey: 'name' };
export const fetcher = async (p: typeof params) => TestData;

export const UserList = pagination(
  'userList',
  { pageSize: 20, kw: 'nihao' },
  fetcher,
  'id',
  'home'
);
export const { START, SUCCESS, initialState, reducer, action, selectAction, saga } = UserList;
