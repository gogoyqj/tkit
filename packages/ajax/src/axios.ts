/**
 * @author: yangqianjun
 * @file: axios封装
 * @Date: 2019-09-02 15:15:27
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-01-08 18:28:58
 */
import axios, { AxiosError, Cancel } from 'axios';
import EventCenter from 'tkit-event-center';
import { AjaxCancelCode, AjaxErrorCode } from './consts';

// @cc: axios 默认配置，可在此处修改
export default axios.create({
  timeout: 5000,
  withCredentials: true,
  headers: {}
});

export const emptyFunc = () => void 0;

/** 检测 axios 响应状态 */
export function onStatusError(error: AxiosError | Error | Cancel) {
  const resp = 'response' in error && error.response;
  // IMP: 400客户端错误可能有response.data
  const err = resp
    ? {
        code: resp.status,
        message: resp.data && resp.data.message ? resp.data.message : resp.statusText
      }
    : {
        code: error instanceof axios.Cancel ? AjaxCancelCode : AjaxErrorCode,
        message: error.message
      };
  if (err.code === 401 || err.code === 403) {
    EventCenter.emit('common.user.status', err);
  }
  return err;
}

export { promiseFactory } from './consts';
