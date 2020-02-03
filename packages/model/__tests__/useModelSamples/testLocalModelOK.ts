import { Tction, M } from 'src/useModel';
// import 'src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题

export const remoteState = { username: 'remote name' };
export const clearState = { username: '' };

export const UserModel = M({
  namespace: 'test',
  state: {
    username: ''
  },
  reducers: {
    doRename: (state, action: Tction<{ username: string }>) => {
      return {
        ...state,
        username: action.payload.username
      };
    },
    doClear: state => {
      return {
        ...state,
        ...clearState
      };
    }
  },
  effects: {
    doFetchName: async ({ tPut }, action: Tction<{ time: number }>): Promise<{}> => {
      await new Promise(rs => {
        // @cc: 请勿修改 delay 时间，单元测试使用，必须第二个参数 - `parser.ts` 解析时才不会报错
        setTimeout(() => {
          rs();
        }, 0);
      });
      return tPut(UserModel.actions.doRename, { username: 'remote name' });
    }
  }
});

// 不应报错
UserModel.actions.doRename({ username: '' });
UserModel.actions.doClear();
UserModel.actions.doFetchName({ time: 1 });
