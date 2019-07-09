import { tCall, tPut } from '@src/createModel';
// import '@src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { overload } from './states';

export function* testOverloadPutAndCall() {
  // 正确
  yield tPut(overload);
  yield tCall(overload);
  yield tPut(overload, '');
  yield tCall(overload, '');
  yield tPut(overload, '', 2);
  yield tCall(overload, '', 2);
}
