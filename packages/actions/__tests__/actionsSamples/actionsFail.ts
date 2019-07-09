import { action, actions } from './actionsOK';

//@cc: 报错，请勿修改，单元测试使用
export const doNewSetUerName: typeof actions.doSetUerName = (username: number) => ({
  ...action,
  payload: { username }
});
