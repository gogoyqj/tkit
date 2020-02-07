import { useModel } from 'src/index';
import { UserModel } from './testLocalModelOK';

export function A(): number {
  const [store, localActions] = useModel(UserModel);

  //@cc: 报错，请勿修改，单元测试使用
  localActions.doRename({ username: 2 });
  localActions.doClear({});
  localActions.doFetchName({ time: '1' });

  const { username, id } = store;
  return username;
}
