import axios, { AxiosError } from 'axios';
import { EventCenter } from 'tkit-event/lib/event';

// @cc: axios 默认配置，可在此处修改
export default axios.create({
  timeout: 5000,
  withCredentials: true,
  headers: {}
});

// @cc: 检测 axios 响应状态
export function onStatusError(error: AxiosError | Error) {
  const err =
    'response' in error && error.response
      ? {
          code: error.response.status,
          message: error.response.statusText
        }
      : { code: 10001, message: error.message };
  if (err.code === 401 || err.code === 403) {
    EventCenter.emit('common.user.status', err);
  }
  return err;
}
