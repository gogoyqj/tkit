/* eslint-disable @typescript-eslint/no-angle-bracket-type-assertion */
import { M, Tction, CustomEffects } from 'tkit-model';
import { TkitAjaxFunction } from 'tkit-ajax';
import { TkitUtils } from 'tkit-types';
import { EventCenter } from 'tkit-event';
import { ASYNC_RESULT_EVENT_NAME, AsyncResultEventType } from './consts';

export interface AsyncForm {
  submit: (...args: any) => any;
  [other: string]: any;
}

export interface AsyncFormProps {
  getForm: (f: AsyncForm | null) => any;
  [other: string]: any;
}

export interface AsyncModalProps {
  // 是否显示Modal
  visible?: boolean;
  // 标题
  title?: React.ReactNode;
  // 内容
  content?: React.ReactNode;
  className?: string;
  // 确定时显示loading效果
  confirmLoading?: boolean;
  // 确定按钮
  onOk?: (...args: any) => Promise<any> | void;
  // 取消按钮
  onCancel?: (...args: any) => Promise<any> | void;
  [other: string]: any;
}

// @IMP: 无参数情形下，返回空数组 - never向下兼容
export type EnsureArgumentsType<F extends TkitAjaxFunction> = TkitUtils.GetArgumentsType<
  F
> extends []
  ? [] | never
  : TkitUtils.GetArgumentsType<F>;

// @IMP: 仅一个参数情形下，返回第一个参数类型
export type EnsureSingleArgumentsType<F extends TkitAjaxFunction> = TkitUtils.GetArgumentsType<
  F
>[1] extends undefined | never
  ? TkitUtils.GetArgumentsType<F>[0]
  : never;

export interface NewAsyncParams<F extends TkitAjaxFunction> {
  // F 仅接收一个参数适用
  params?: EnsureSingleArgumentsType<F>;
  callback?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  onError?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  onSuccess?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  errorMsg?: ((res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => React.ReactNode) | React.ReactNode;
  successMsg?: ((res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => React.ReactNode) | React.ReactNode;
  // F 接收多个参数适用 - 必须返回数组
  paramsGenerator?: (params: NewAsyncParams<F>) => EnsureArgumentsType<F>;
  ASYNC_ID?: number;
  extraParams?: EnsureSingleArgumentsType<F>; // 表单情形下返回数据
}

export interface IAsyncConfirmedParams<F extends TkitAjaxFunction> extends NewAsyncParams<F> {
  fetch: F;
  indicator?: React.ReactNode;
}

export interface IAsyncActionProps<F extends TkitAjaxFunction> extends NewAsyncParams<F> {
  fetch: F;
  // 弹窗配置
  modalProps?: AsyncModalProps;
  // 表单配置
  formProps?: Partial<AsyncFormProps>;
}

// 单个异步操作
export interface AsyncStatus extends Omit<IAsyncActionProps<TkitAjaxFunction>, 'fetch'> {
  confirmed?: boolean;
  isFetch?: boolean;
  isSuccess?: boolean;
  response?: any;
  ASYNC_ID?: number;
  // @IMP: 修改实现之后，需要这个字段来判断是不是弹窗
  isModal?: boolean;
  // @IMP: 自定indicator
  indicator?: React.ReactNode;
}

// 队伍
export interface IAsyncState {
  asyncStatus: AsyncStatus[];
}

let ASYNC_ID = 1;

export const getAsyncId = () => ASYNC_ID++;

const confirmedPayloadCreator = <F extends TkitAjaxFunction>(
  payload: IAsyncConfirmedParams<F>,
  fetch?: F
) => {
  if (fetch) {
    payload.fetch = fetch;
  }
  const { onError, onSuccess, callback, ASYNC_ID: id = ASYNC_ID++ } = payload;
  return {
    ...payload,
    ASYNC_ID: id,
    callback: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => {
      if (!res.code) {
        if (onSuccess) {
          onSuccess(res);
        }
      } else {
        if (onError) {
          onError(res);
        }
      }
      if (callback) {
        callback(res);
      }
    }
  };
};

const asyncModelInitialState: IAsyncState = {
  asyncStatus: []
};

const model = M({
  namespace: 'tkit-async/Model',
  state: asyncModelInitialState,
  reducers: {
    doAsyncStart: (state, action: Tction<AsyncStatus>): IAsyncState => {
      return {
        ...state,
        asyncStatus: state.asyncStatus.concat([
          {
            errorMsg: null,
            successMsg: null,
            ...action.payload,
            response: null,
            isFetch: false,
            confirmed: false
          }
        ])
      };
    },
    doAsyncConfirmedStart: (state, action: Tction<AsyncStatus>): IAsyncState => {
      let isNew = true;
      const { ASYNC_ID } = action.payload;
      const newStatus = state.asyncStatus.map(status => {
        if (status.ASYNC_ID === ASYNC_ID) {
          isNew = false;
          const newStatus: AsyncStatus = {
            errorMsg: null,
            successMsg: null,
            ...status,
            ...action.payload,
            response: null,
            isFetch: true,
            confirmed: true
          };
          return newStatus;
        }
        return status;
      });
      if (isNew) {
        newStatus.push({
          errorMsg: null,
          successMsg: null,
          ...action.payload,
          response: null,
          isFetch: true,
          confirmed: true
        });
      }
      return {
        ...state,
        asyncStatus: newStatus
      };
    },
    doAsyncEnd: (state, action: Tction<AsyncStatus>): IAsyncState => {
      const { ASYNC_ID: id, successMsg, errorMsg, response, isSuccess } = action.payload;
      return {
        ...state,
        asyncStatus: state.asyncStatus.reduce<AsyncStatus[]>((queue, status) => {
          if (status.ASYNC_ID === id) {
            const { successMsg: successMsgInStore, errorMsg: errorMsgInStore, isFetch } = status;
            const notCancel = isSuccess !== undefined;
            // @IMP: 正在执行的effect无法取消
            if (notCancel || isFetch) {
              if (notCancel) {
                const type = isSuccess ? 'success' : 'error';
                const defaultMsg = isSuccess ? '操作成功' : '操作失败';
                const customMsg = isSuccess ? successMsg : errorMsg;
                const storeMsg = isSuccess ? successMsgInStore : errorMsgInStore;
                if (customMsg !== false && storeMsg !== false) {
                  let msg: React.ReactNode = customMsg || storeMsg || defaultMsg;
                  if (typeof msg === 'function') {
                    msg = msg(response);
                  }
                  const e: AsyncResultEventType = { type, message: msg };
                  EventCenter.emit(ASYNC_RESULT_EVENT_NAME, e);
                }
                // @IMP: 失败重置状态
                if (isSuccess === false) {
                  queue.push({
                    ...status,
                    confirmed: false,
                    isFetch: false
                  });
                }
              } else {
                // isFetch
                queue.push({
                  ...status,
                  isFetch: false
                });
              }
            }
          } else {
            queue.push(status);
          }
          return queue;
        }, [])
      };
    }
  },
  effects: {
    async doAsync<F extends TkitAjaxFunction>(
      { tPut }: CustomEffects,
      action: Tction<Omit<IAsyncActionProps<F>, 'ASYNC_ID'>>
    ) {
      await tPut(model.actions.doAsyncStart, {
        ASYNC_ID: 'ASYNC_ID' in action.payload ? action.payload['ASYNC_ID'] : getAsyncId(),
        isModal: true,
        ...action.payload
      });
    },
    async doAsyncConfirmed<F extends TkitAjaxFunction>(
      { tPut }: CustomEffects,
      action: Tction<IAsyncConfirmedParams<F>>
    ) {
      const payload = confirmedPayloadCreator(action.payload);
      await tPut(model.actions.doAsyncConfirmedStart, payload);
      let res: any;
      const { paramsGenerator, params, extraParams, fetch, callback, ASYNC_ID } = payload;
      try {
        // 参数类型处理
        const mergedParams: any[] = [];
        if (typeof paramsGenerator === 'function') {
          const generatedParams = paramsGenerator(action.payload);
          mergedParams.push.apply(
            mergedParams,
            Array.isArray(generatedParams) ? generatedParams : [generatedParams]
          );
        } else {
          const isParamsArray = Array.isArray(params);
          const isExtraPramssArray = Array.isArray(extraParams);
          // 不对数组进行 merge，如有需要
          if (isParamsArray && isExtraPramssArray) {
            const msg = `当 fetch 拥有多个参数情形下, async 无法正确处理，请在 paramsGenerator 内处理`;
            throw Error(msg);
          } else if (!isParamsArray && !isExtraPramssArray) {
            // 仅 merge object
            mergedParams.push.apply(mergedParams, [
              (params && typeof params === 'object') ||
              (extraParams && typeof extraParams === 'object')
                ? { ...params, ...extraParams }
                : extraParams || params
            ]);
          } else if (isParamsArray || isExtraPramssArray) {
            mergedParams.push.apply(mergedParams, isParamsArray ? params : extraParams);
          }
        }
        res = await fetch(...mergedParams);
      } catch (err) {
        res = {
          code: 10002,
          message: err.message
        };
      }
      if (callback) {
        callback(res);
      }
      const isSuccess = !(res && res.code);
      await tPut(model.actions.doAsyncEnd, {
        ASYNC_ID,
        isSuccess,
        response: res
      });
    },
    async doAsyncCancel({ tPut }: CustomEffects, action: Tction<number>) {
      await tPut(model.actions.doAsyncEnd, {
        ASYNC_ID: action.payload,
        successMsg: false
      });
    }
  }
});

export interface AsyncModelActions {
  doAsync: <F extends TkitAjaxFunction>(payload: Omit<IAsyncActionProps<F>, 'ASYNC_ID'>) => any;
  doAsyncConfirmed: <F extends TkitAjaxFunction>(payload: IAsyncConfirmedParams<F>) => any;
  doAsyncCancel: (ASYNC_ID: number) => any;
}

export const asyncModel: Omit<typeof model, 'actions'> & {
  actions: Omit<typeof model.actions, keyof AsyncModelActions> & AsyncModelActions;
} = model as any;

export type AsyncModelType = typeof asyncModel;
