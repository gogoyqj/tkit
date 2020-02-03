import { tCall, tPut } from 'src/createModel';
// import 'src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { modelWithoutEffects } from './testCreateModelOK';

export function* testModelWithoutEffectsPutAndCall() {
  //@cc: 报错，请勿修改，单元测试使用
  yield tPut(modelWithoutEffects.actions.testNoArguments, '');
  yield tCall(modelWithoutEffects.actions.testNoArguments, '');

  yield tPut(modelWithoutEffects.actions.testOneArguments);
  yield tCall(modelWithoutEffects.actions.testOneArguments);
}
