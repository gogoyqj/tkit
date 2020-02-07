/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2019-12-17 20:16:34
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 14:25:14
 */
import { ItCall, ItPut } from 'src/index';
import { modelWithoutEffects } from './testCreateModelOK';

const tPut: ItPut = () => void 0;
const tCall: ItCall = () => void 0;

export function* testModelWithoutEffectsPutAndCall() {
  //@cc: 报错，请勿修改，单元测试使用
  yield tPut(modelWithoutEffects.actions.testNoArguments, '');
  yield tCall(modelWithoutEffects.actions.testNoArguments, '');

  yield tPut(modelWithoutEffects.actions.testOneArguments);
  yield tCall(modelWithoutEffects.actions.testOneArguments);
}
