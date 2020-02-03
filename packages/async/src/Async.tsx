/**
 * @author: yangqianjun
 * @file: 全局效果容器
 * @Date: 2019-11-19 16:14:12
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-23 18:20:53
 */
import React, { useEffect, useMemo } from 'react';
import { EventCenter } from 'tkit-event';
import { useAsync, UseAsyncConfig } from './useAsync';
import { AsyncStatus, AsyncFormProps, AsyncModalProps, asyncModel } from './asyncModel';
import {
  ASYNC_EFFECT_EVENT_NAME,
  AsyncEffectEventType,
  ASYNC_RESULT_EVENT_NAME,
  AsyncResultEventType,
  ASYNC_STATUS_CHANGE_NAME
} from './consts';

export interface AsyncProps {
  /**
   * 加载效果组件【每个effect对应一个效果】
   * @deprecated 不推荐使用
   */
  loading?: React.ComponentType<{ status: AsyncStatus }>;
  /** 全局加载效果组件【所有effect共用一个效果】3.0.6+ */
  sharedLoading?: React.ComponentType;
  /** 显示副作用提示信息的函数 */
  tips?: (e: AsyncResultEventType) => any;
  /**  Model弹窗组件，兼容antd Model */
  modal: React.ComponentType<AsyncModalProps>;
  /** Form组件 */
  form: React.ComponentType<AsyncFormProps>;
}

/** 异步操作容器 */
export default function Async(props: AsyncProps) {
  const { loading: Loading, modal: Modal, form: Form, tips, sharedLoading: SL } = props;

  // IMP: 优化
  const config: UseAsyncConfig = useMemo(
    () => ({
      renderForm: props => <Form {...props} />
    }),
    []
  );

  const [queue, actions] = useAsync(config);

  // 提示信息处理
  useEffect(() => {
    // IMP: 异步，解决 Render methods should be a pure function of props and state.
    // eslint-disable-next-line prefer-spread
    const handler = tips ? (...args: any) => setTimeout(() => tips.apply(null, args), 0) : tips;
    if (handler) {
      EventCenter.on(ASYNC_RESULT_EVENT_NAME, handler);
    }
    return () => {
      if (handler) {
        EventCenter.off(ASYNC_RESULT_EVENT_NAME, handler);
      }
    };
  }, [tips]);

  // 全局 API 和 actions 打通
  useEffect(() => {
    const handler = ({ type, payload }: AsyncEffectEventType) => {
      if (type in actions) {
        actions[type as string].call(null, {
          effectName: `${asyncModel.namespace}/${type as string}`,
          ...payload
        });
      }
    };
    EventCenter.on(ASYNC_EFFECT_EVENT_NAME, handler);
    return () => {
      EventCenter.off(ASYNC_EFFECT_EVENT_NAME, handler);
    };
  }, [actions]);

  // 检测 queue 变化
  useEffect(() => {
    EventCenter.emit(ASYNC_STATUS_CHANGE_NAME, queue);
  }, [queue]);

  let loadingCount = 0;
  const all = queue.map(status => {
    const { ASYNC_ID, modalProps, isFetch, isModal, indicator, visible = true } = status;
    if (isModal) {
      return (
        <Modal
          afterClose={actions.doClearModal}
          {...modalProps}
          key={ASYNC_ID}
          visible={visible}
          confirmLoading={isFetch}
        >
          {modalProps && modalProps.content}
        </Modal>
      );
    } else if (isFetch) {
      if (indicator !== undefined) {
        return indicator;
      }
      if (Loading) {
        return <Loading key={ASYNC_ID} status={status} />;
      }
      loadingCount++;
    }
    return null;
  });
  return (
    <>
      {all}
      {loadingCount && SL ? <SL /> : null}
    </>
  );
}
