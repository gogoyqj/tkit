import { useModel } from '@src/useModel';
// import '@src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
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
