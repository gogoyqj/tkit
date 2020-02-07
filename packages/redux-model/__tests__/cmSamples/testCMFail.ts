/**
 * @file: 应该抛出 ts 语法错误
 * @author: yangqianjun
 * @Date: 2019-12-20 09:36:31
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 17:32:21
 */

import { TkitUtils } from 'tkit-types';
import { CM, Tction } from 'src/index';
import { modelWithEffectsState } from '../createModelSamples/states';

export const cmFailModel = CM({
  state: modelWithEffectsState,
  namespace: 'cmModel',
  reducers: {
    /** 写入名字 */
    doSetName: (state, action: Tction<number>) => {
      state.name = action.payload;
    }
  },
  effects: {
    /** 拉取名字 */
    *doFetchName({ tPut }, action: Tction<string>): Iterator<{}, any, any> {
      yield new Promise(rs => window.setTimeout(rs, 100));
      tPut(cmFailModel.actions.doSetName, action.payload);
    }
  }
});

// should throw error
type mustString = TkitUtils.GetArgumentsType<typeof cmFailModel.actions.doFetchName>[0];
cmFailModel.actions.doFetchName(2);
export const testString: mustString = 2;

// should throw error
type mustNumber = TkitUtils.GetArgumentsType<typeof cmFailModel.actions.doSetName>[0];
cmFailModel.actions.doSetName('2');
export const testNumber: mustNumber = '2';
