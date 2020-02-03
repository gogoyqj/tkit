/**
 * @author: yangqianjun
 * @file: 筛选出需要的Status Hooks
 * @Date: 2019-10-24 13:52:32
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-06 18:37:43
 */
import { useEffect, useState } from 'react';
import { EventCenter } from 'tkit-event';
import { AsyncStatus } from './asyncModel';
import { ASYNC_STATUS_CHANGE_NAME } from './consts';

export type AsyncStatusSelector = (status: AsyncStatus) => boolean;

const statusListSelector: (
  status: AsyncStatus[],
  selector?: AsyncStatusSelector
) => AsyncStatus | undefined = (statusList, selector) => {
  return statusList.find(status => {
    if (status.isFetch) {
      if ((selector && selector(status)) || !selector) {
        return status;
      }
    }
    return;
  });
};

/** 筛选出需要的Status */
export function useAsyncStatus(selector?: AsyncStatusSelector): [AsyncStatus?] {
  const [status, setStatus] = useState<AsyncStatus>();
  useEffect(() => {
    const handler = (newStatusList: AsyncStatus[]) => {
      const newStatus = statusListSelector(newStatusList, selector);
      if (newStatus !== status) {
        setStatus(newStatus);
      }
    };
    EventCenter.on(ASYNC_STATUS_CHANGE_NAME, handler);
    return () => {
      EventCenter.off(ASYNC_STATUS_CHANGE_NAME, handler);
    };
  }, [selector, status]);
  return [status];
}
