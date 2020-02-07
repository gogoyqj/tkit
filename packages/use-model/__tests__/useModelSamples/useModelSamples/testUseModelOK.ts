import { useModel } from 'src/index';
import { UserModel } from './testLocalModelOK';

export function A(): string {
  const [store, localActions] = useModel(UserModel);
  // 不应报错
  localActions.doRename({ username: '' });
  localActions.doClear();
  localActions.doFetchName({ time: 1 });

  const { username } = store;
  return username;
}
