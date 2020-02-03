import { tCall, tPut } from 'src/createModel';
// import 'src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { modelWithEffects } from './testCreateModelOK';

export function* testWithEffectsPutAndCall() {
  // @cc: 报错，请勿修改，单元测试使用
  yield tPut(modelWithEffects.actions.testAsyncNoArguments, '');
  yield tCall(modelWithEffects.actions.testAsyncNoArguments, '');

  yield tPut(modelWithEffects.actions.testAsyncOneArguments, '', '');
  yield tCall(modelWithEffects.actions.testAsyncOneArguments, '', '');
}
