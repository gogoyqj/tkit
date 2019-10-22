/* eslint-disable @typescript-eslint/no-angle-bracket-type-assertion */
import { M, Tction, CustomEffects } from 'tkit-model';
import { TkitAjaxFunction } from 'tkit-ajax';
import { TkitUtils } from 'tkit-types';
import { EventCenter } from 'tkit-event';
import { ASYNC_RESULT_EVENT_NAME, AsyncResultEventType } from './consts';

export interface AsyncForm {
  /**
   * Form表单组件必须实现submit方法
   */
  submit: (...args: any) => any;
  [other: string]: any;
}

export interface AsyncFormProps {
  /**
   * Form表单组件需支持getForm Props，并通过该回调传递组件实例
   */
  getForm?: (f: AsyncForm | null) => any;
  [other: string]: any;
}

export interface AsyncModalProps {
  /**
   * 是否显示Modal
   */
  visible?: boolean;
  /**
   * 标题
   */
  title?: React.ReactNode;
  /**
   * 内容
   */
  content?: React.ReactNode;
  className?: string;
  /**
   * 确定时显示loading效果
   */
  confirmLoading?: boolean;
  /**
   * 点击确定按钮回调
   */
  onOk?: (...args: any) => Promise<any> | void;
  /**
   * 点击取消按钮回调
   */
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
  /**
   * F 仅接收一个参数适用
   */
  params?: EnsureSingleArgumentsType<F>;
  /**
   * 回调
   */
  callback?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  /**
   * 取消回调
   */
  onCancel?: () => any;
  /**
   * 错误回调
   */
  onError?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  /**
   * 成功回调
   */
  onSuccess?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  /**
   * 错误信息，配置成false，则不提示错误信息
   */
  errorMsg?: ((res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => React.ReactNode) | React.ReactNode;
  /**
   * 成功信息，配置成false，则不提示成功信息
   */
  successMsg?: ((res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => React.ReactNode) | React.ReactNode;
  /**
   * F 接收多个参数适用 - 必须返回数组
   */
  paramsGenerator?: (params: NewAsyncParams<F>) => EnsureArgumentsType<F>;
  ASYNC_ID?: number;
  /**
   * 表单情形下返回数据
   */
  extraParams?: EnsureSingleArgumentsType<F>;
  /**
   * 来源
   */
  channel?: string;
}

export interface IAsyncConfirmedParams<F extends TkitAjaxFunction> extends NewAsyncParams<F> {
  /**
   * 副作用函数
   */
  fetch: F;
  /**
   * loading效果，配置成false不显示loading
   */
  indicator?: React.ReactNode;
  /**
   * 来源
   */
  channel?: string;
}

export interface IAsyncActionProps<F extends TkitAjaxFunction> extends NewAsyncParams<F> {
  /**
   * 副作用函数
   */
  fetch: F;
  /**
   * Modal弹窗配置
   */
  modalProps?: AsyncModalProps;
  /**
   * Form表单配置
   */
  formProps?: Partial<AsyncFormProps>;
}

// 单个异步操作
export interface AsyncStatus extends Omit<IAsyncActionProps<TkitAjaxFunction>, 'fetch'> {
  /**
   * 是否已确定
   */
  confirmed?: boolean;
  /**
   * 副作用是否正在执行
   */
  isFetch?: boolean;
  /**
   * 是否成功
   */
  isSuccess?: boolean;
  /**
   * 副作用响应
   */
  response?: any;
  ASYNC_ID?: number;
  // @IMP: 修改实现之后，需要这个字段来判断是不是弹窗
  /**
   * 是否Modal弹窗
   */
  isModal?: boolean;
  // @IMP: 自定indicator
  /**
   * 自定义loading效果
   */
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
          const { modalProps, formProps } = status;
          const newStatus: AsyncStatus = {
            errorMsg: null,
            successMsg: null,
            ...status,
            ...action.payload,
            response: null,
            isFetch: true,
            confirmed: true
          };
          // @IMP: modalProps & formProps
          modalProps && (newStatus.modalProps = modalProps);
          formProps && (newStatus.formProps = formProps);

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
                  if (msg) {
                    const e: AsyncResultEventType = { type, message: msg };
                    EventCenter.emit(ASYNC_RESULT_EVENT_NAME, e);
                  }
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
    doAsync: [
      async function<F extends TkitAjaxFunction>(
        { tPut }: CustomEffects,
        action: Tction<Omit<IAsyncActionProps<F>, 'ASYNC_ID'>>
      ) {
        await tPut(model.actions.doAsyncStart, {
          ASYNC_ID: 'ASYNC_ID' in action.payload ? action.payload['ASYNC_ID'] : getAsyncId(),
          isModal: true,
          ...action.payload
        });
      },
      {
        silent: true
      }
    ],
    doAsyncConfirmed: [
      async <F extends TkitAjaxFunction>(
        { tPut }: CustomEffects,
        action: Tction<IAsyncConfirmedParams<F>>
      ) => {
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
      {
        silent: true
      }
    ],
    doAsyncCancel: [
      async ({ tPut }: CustomEffects, action: Tction<number>) => {
        await tPut(model.actions.doAsyncEnd, {
          ASYNC_ID: action.payload,
          successMsg: false
        });
      },
      { silent: true }
    ]
  }
});
// @IMP: 类型推导遇到泛型不好使了，必须手写类型
export interface AsyncModelActions {
  doAsync: <F extends TkitAjaxFunction>(payload: Omit<IAsyncActionProps<F>, 'ASYNC_ID'>) => any;
  doAsyncConfirmed: <F extends TkitAjaxFunction>(payload: IAsyncConfirmedParams<F>) => any;
  doAsyncCancel: (ASYNC_ID: number) => any;
}

export const asyncModel: Omit<typeof model, 'actions'> & {
  actions: Omit<typeof model.actions, keyof AsyncModelActions> & AsyncModelActions;
} = model as any;

export type AsyncModelType = typeof asyncModel;
