import { TkitUtils } from 'tkit-types';
import { EventCenter } from 'tkit-event';
import { TkitAjaxFunction } from 'tkit-ajax';
import { AsyncModelType, IAsyncActionProps, IAsyncConfirmedParams } from './asyncModel';
import { ASYNC_EFFECT_EVENT_NAME, AsyncEffectEventType } from './consts';
import Async from './Async';

export * from './asyncModel';
export * from './consts';
export * from './Async';
export default Async;

type doAsyncType = AsyncModelType['actions']['doAsync'];
type doAsyncArgType = TkitUtils.GetArgumentsType<doAsyncType>[0];

function wrapper(payload: doAsyncArgType, cb: (newPayload: doAsyncArgType) => any) {
  return new Promise((rs, rj) => {
    const { callback, onCancel } = payload;
    cb({
      ...payload,
      onCancel: () => {
        onCancel && onCancel();
        rj();
      },
      callback: res => {
        if (callback) {
          callback(res);
        }
        rs(res);
      }
    });
  });
}

/**
 * 执行需要显示确定弹窗【可内置表单】副作用
 */
export const doAsync: <F extends TkitAjaxFunction>(
  payload: Omit<IAsyncActionProps<F>, 'ASYNC_ID'>
) => ReturnType<F> = p => {
  return wrapper(p, payload => {
    const e: AsyncEffectEventType = {
      type: 'doAsync',
      payload
    };
    EventCenter.emit(ASYNC_EFFECT_EVENT_NAME, e);
  }) as ReturnType<typeof p['fetch']>;
};

/**
 * 执行副作用
 */
export const doAsyncConfirmed: <F extends TkitAjaxFunction>(
  payload: IAsyncConfirmedParams<F>
) => ReturnType<F> = p => {
  return wrapper(p, payload => {
    const e: AsyncEffectEventType = {
      type: 'doAsyncConfirmed',
      payload: payload
    };
    EventCenter.emit(ASYNC_EFFECT_EVENT_NAME, e);
  }) as ReturnType<typeof p['fetch']>;
};
