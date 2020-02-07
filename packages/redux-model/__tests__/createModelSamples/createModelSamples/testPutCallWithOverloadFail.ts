/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2019-12-17 20:16:34
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 11:59:02
 */
import { ItCall } from 'src/index';
import { overload } from './states';

const tCall: ItCall = () => void 0;

export function* testOverloadPutAndCall() {
  // @cc: 报错，请勿修改，单元测试使用
  yield tCall(overload, 2);

  yield tCall(overload, 2, 2);
  yield tCall(overload, '', '');
  yield tCall(overload, 2, '');
}
