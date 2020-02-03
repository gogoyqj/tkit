/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @author: yangqianjun
 * @file: 类型检测符合预期
 * @Date: 2019-12-05 14:04:55
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-10 11:51:25
 */
import * as CONSTS from './consts';

export async function __test__() {
  {
    // @IMP: null
    type NotNever = keyof CONSTS.INull;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: code only
    type NotNever = keyof CONSTS.ICodeOnly;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: code and message
    type NotNever = keyof CONSTS.ICodeAndMessage;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: 数字
    type NotNever = keyof CONSTS.IFullWithNumber;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: 字符串
    type NotNever = keyof CONSTS.IFullWithString;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: 空数组
    type NotNever = keyof CONSTS.IEmptyArray;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: 空对象
    type NotNever = keyof CONSTS.IEmpty;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: 非空数组
    type NotNever = keyof CONSTS.IFullWithArray;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: 非空对象
    type NotNever = keyof CONSTS.IFullWithObject;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
  {
    // @IMP: Array Map
    type NotNever = keyof CONSTS.IArrayMap;
    const a: NotNever[] = [''];
    const b: NotNever[] = [1];
    const c: NotNever[] = ['', 1];
  }
}
