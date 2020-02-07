/**
 * @file: MM 语法层面测试
 * @author: yangqianjun
 * @Date: 2019-12-20 12:34:59
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-20 12:58:39
 */

import { Tction, MM } from 'src/index';

export const UserMMModelState = {
  username: ''
};

export const UserMMModel = MM({
  namespace: 'test',
  state: UserMMModelState,
  reducers: {
    doRename: (state, action: Tction<{ username: string }>) => {
      state.username = action.payload.username;
    },
    doClear: state => {
      state.username = '';
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
      return tPut(UserMMModel.actions.doRename, { username: `${action.payload.time}` });
    }
  }
});

// should no error
() => {
  UserMMModel.actions.doRename({ username: '' });
  UserMMModel.actions.doClear();
  UserMMModel.actions.doFetchName({ time: 1 });
};
