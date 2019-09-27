import React, { useEffect, useMemo } from 'react';
import { EventCenter } from 'tkit-event';
import { useAsync, UseAsyncConfig } from './useAsync';
import { AsyncStatus, AsyncFormProps, AsyncModalProps } from './asyncModel';
import {
  ASYNC_EFFECT_EVENT_NAME,
  AsyncEffectEventType,
  ASYNC_RESULT_EVENT_NAME,
  AsyncResultEventType
} from './consts';

export interface AsyncProps {
  loading?: React.ComponentType<{ status: AsyncStatus }>; // 加载效果组件
  tips?: (e: AsyncResultEventType) => any;
  modal: React.ComponentType<AsyncModalProps>;
  form: React.ComponentType<AsyncFormProps>;
}

export default function Async(props: AsyncProps) {
  const { loading: Loading, modal: Modal, form: Form, tips } = props;
  // @IMP: 优化
  const config: UseAsyncConfig = useMemo(
    () => ({
      renderForm: props => <Form {...props} />
    }),
    []
  );
  const [queue, actions] = useAsync(config);
  useEffect(() => {
    // @IMP: 异步，解决 Render methods should be a pure function of props and state.
    const handler = tips ? (...args: any) => setTimeout(() => tips.apply(null, args), 0) : tips;
    if (handler) {
      EventCenter.addListener(ASYNC_RESULT_EVENT_NAME, handler);
    }
    return () => {
      if (handler) {
        EventCenter.removeListener(ASYNC_RESULT_EVENT_NAME, handler);
      }
    };
  }, [tips]);
  useEffect(() => {
    const handler = ({ type, payload }: AsyncEffectEventType) => {
      if (type in actions) {
        actions[type].call(null, payload);
      }
    };
    EventCenter.addListener(ASYNC_EFFECT_EVENT_NAME, handler);
    return () => {
      EventCenter.removeListener(ASYNC_EFFECT_EVENT_NAME, handler);
    };
  }, [actions]);
  return (
    <>
      {queue.map(status => {
        const { confirmed, ASYNC_ID, modalProps = {}, isFetch, isModal, indicator } = status;
        if (isModal) {
          if (!confirmed || isFetch) {
            return (
              <Modal {...modalProps} key={ASYNC_ID} visible confirmLoading={isFetch}>
                {modalProps.content}
              </Modal>
            );
          }
        } else if (Loading && isFetch) {
          return indicator !== undefined ? indicator : <Loading key={ASYNC_ID} status={status} />;
        }
        return null;
      })}
    </>
  );
}
