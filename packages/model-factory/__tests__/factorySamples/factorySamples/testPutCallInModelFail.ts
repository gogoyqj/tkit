/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2019-12-17 20:16:34
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 19:54:58
 */
import factory, { Tction } from 'src/index';
import { modelWithEffectsState } from './states';

const testModelWithEffects = factory({
  namespace: 'socketmodelWithoutEffects',
  state: modelWithEffectsState,
  reducers: {
    testNoArguments: state => ({ ...state }),
    testOneArguments: (state, action: Tction<string>) => ({ ...state, name: action.payload })
  },
  effects: {
    //@cc: 报错，请勿修改，单元测试使用
    *testAsyncNoArguments({ tPut }): Iterator<any> {
      yield tPut(testModelWithEffects.actions.testAsyncNoArguments, '');
    },
    *testAsyncOneArguments({ tPut }, action: Tction<string>): Iterator<any> {
      yield tPut(testModelWithEffects.actions.testAsyncOneArguments);
    }
  }
});
