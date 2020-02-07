import { UserModel } from './testLocalModelOK';

//@cc: 报错，请勿修改，单元测试使用
UserModel.actions.doRename({ username: 2 });
UserModel.actions.doClear({});
UserModel.actions.doFetchName({ time: '1' });
