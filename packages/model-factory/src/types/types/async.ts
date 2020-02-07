/**
 * @file: description
 * @author: yangqianjun
 * @Date: 2020-02-07 11:13:48
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 15:55:04
 */

/** 从 tkit-async 拆分过来 */
export interface IAsyncConfirmedMsg {
  fetch: any;
  errorMsg?: any;
  successMsg?: any;
  indicator?: React.ReactNode;
  channel?: string;
  effectName?: string;
}
