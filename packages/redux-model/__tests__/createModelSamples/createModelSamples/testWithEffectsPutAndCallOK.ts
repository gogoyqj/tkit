/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2019-12-17 20:16:34
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 11:59:33
 */
import { ItCall, ItPut } from 'src/index';
import { modelWithEffects } from './testCreateModelOK';

const tPut: ItPut = () => void 0;
const tCall: ItCall = () => void 0;

export function* testWithEffectsPutAndCall() {
  // 正确
  yield tPut(modelWithEffects.actions.testNoArguments);
  yield tCall(modelWithEffects.actions.testNoArguments);

  yield tPut(modelWithEffects.actions.testOneArguments, '');
  yield tCall(modelWithEffects.actions.testOneArguments, '');

  yield tPut(modelWithEffects.actions.testAsyncNoArguments);
  yield tCall(modelWithEffects.actions.testAsyncNoArguments);

  yield tPut(modelWithEffects.actions.testAsyncOneArguments, '');
  yield tCall(modelWithEffects.actions.testAsyncOneArguments, '');
}
