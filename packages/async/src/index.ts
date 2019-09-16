import { EventCenter } from 'tkit-event';
import { AsyncModelType } from './asyncModel';
import { ASYNC_EFFECT_EVENT_NAME, AsyncEffectEventType } from './consts';
import Async from './Async';

export * from './asyncModel';
export * from './consts';
export * from './Async';
export default Async;

export const doAsync: AsyncModelType['actions']['doAsync'] = (p: any) => {
  const e: AsyncEffectEventType = {
    type: 'doAsync',
    payload: p
  };
  EventCenter.emit(ASYNC_EFFECT_EVENT_NAME, e);
};

export const doAsyncConfirmed: AsyncModelType['actions']['doAsyncConfirmed'] = (p: any) => {
  const e: AsyncEffectEventType = {
    type: 'doAsyncConfirmed',
    payload: p
  };
  EventCenter.emit(ASYNC_EFFECT_EVENT_NAME, e);
};
