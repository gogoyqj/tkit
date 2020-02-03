/**
 * @file: 不应该抛出语法错误
 * @author: yangqianjun
 * @Date: 2019-12-20 09:36:31
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-20 11:17:31
 */

import { CM, Tction } from 'src/cm';
import { modelWithEffectsState } from '../createModelSamples/states';

export const cmModel = CM({
  state: modelWithEffectsState,
  namespace: 'cmModel',
  reducers: {
    /** 写入名字 */
    doSetName: (state, action: Tction<string>) => {
      state.name = action.payload;
    }
  },
  effects: {
    /** 拉取名字 */
    *doFetchName({ tPut }, action: Tction<number>): Iterator<{}, any, any> {
      yield new Promise(rs => window.setTimeout(rs, 100));
      tPut(cmModel.actions.doSetName, `${action.payload}`);
    }
  }
});

// should no error
() => {
  cmModel.actions.doFetchName(2);
  cmModel.actions.doSetName('2');
};
