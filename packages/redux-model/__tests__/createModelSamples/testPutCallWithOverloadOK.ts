/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2019-12-17 20:16:34
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 11:59:13
 */
import { ItCall, ItPut } from 'src/index';
import { overload } from './states';

const tPut: ItPut = () => void 0;
const tCall: ItCall = () => void 0;

export function* testOverloadPutAndCall() {
  // 正确
  yield tPut(overload);
  yield tCall(overload);
  yield tPut(overload, '');
  yield tCall(overload, '');
  yield tPut(overload, '', 2);
  yield tCall(overload, '', 2);
}
