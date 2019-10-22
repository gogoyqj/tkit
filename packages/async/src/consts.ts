import { AsyncModelType } from './asyncModel';

export const ASYNC_EFFECT_EVENT_NAME = 'ASYNC_EFFECT_EVENT_NAME';
export interface AsyncEffectEventType {
  type: keyof AsyncModelType['actions'];
  payload: any;
}

export const ASYNC_RESULT_EVENT_NAME = 'ASYNC_RESULT_EVENT_NAME';
export interface AsyncResultEventType {
  /**
   * 副作用信息类型
   */
  type: 'error' | 'success';
  /**
   * 副作用提示信息
   */
  message: React.ReactNode;
}
