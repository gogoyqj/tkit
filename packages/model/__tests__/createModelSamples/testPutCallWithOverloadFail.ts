import { tCall, tPut } from '@src/createModel';
// import '@src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { overload } from './states';

export function* testOverloadPutAndCall() {
  // @cc: 报错，请勿修改，单元测试使用
  yield tCall(overload, 2);

  yield tCall(overload, 2, 2);
  yield tCall(overload, '', '');
  yield tCall(overload, 2, '');
}
