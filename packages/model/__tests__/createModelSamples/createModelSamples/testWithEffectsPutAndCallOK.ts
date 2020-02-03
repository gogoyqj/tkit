import { tCall, tPut } from 'src/createModel';
// import 'src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { modelWithEffects } from './testCreateModelOK';

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
