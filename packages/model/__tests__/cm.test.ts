/**
 * @file: CM 使用层面测试
 * @author: yangqianjun
 * @Date: 2019-12-20 11:14:36
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-20 11:30:22
 */

import { cmModel } from './cmSamples/testCMOK';
import { modelWithEffectsState } from './createModelSamples/states';

describe('cm ok', () => {
  // 仅测试包装后的 reducers 是否 ok
  it('cm reducer ok', () => {
    const newName = 'newName';
    const { reducers, actions, namespace } = cmModel;
    const initialState = { [namespace]: { ...modelWithEffectsState } };

    // test set name
    {
      const action = actions.doSetName(newName);
      const newState = reducers(initialState as any, action as any);
      // immer
      expect(initialState[namespace] !== newState[namespace]).toBeTruthy();
      expect(newState[namespace].name).toEqual(newName);
    }
  });
});
