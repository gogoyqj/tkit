/**
 * @author: yangqianjun
 * @file: 异步操作模型
 * @Date: 2019-11-19 16:14:12
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 15:55:19
 */

/* eslint-disable @typescript-eslint/no-angle-bracket-type-assertion */
import { M, Tction, IAsyncConfirmedMsg, BaseEffectsUtils } from 'tkit-use-model';
import { TkitAjaxFunction, AjaxCancelCode } from 'tkit-ajax';
import { TkitUtils } from 'tkit-types';
import { EventCenter } from 'tkit-event';
import { ASYNC_RESULT_EVENT_NAME, AsyncResultEventType } from './consts';

export interface AsyncForm {
  /** Form表单组件必须实现submit方法，submit 方法需返回表单 values 对象或者 Promise<values> */
  submit: (...args: any) => any;
  [other: string]: any;
}

export interface AsyncFormProps {
  /** Form表单组件需支持getForm Props，并通过该回调传递组件实例 */
  getForm?: (f: AsyncForm | null) => any;
  [other: string]: any;
}

export interface AsyncModalProps {
  /** 是否显示Modal */
  visible?: boolean;
  /** 标题 */
  title?: React.ReactNode;
  /** 内容 */
  content?: React.ReactNode;
  className?: string;
  /** 确定时显示loading效果 */
  confirmLoading?: boolean;
  /** 点击确定按钮回调 */
  onOk?: (...args: any) => Promise<any> | void;
  /** 点击取消按钮回调 */
  onCancel?: (...args: any) => Promise<any> | void;
  /** Modal 完全关闭后的回调 */
  afterClose?: (...args: any) => any;
  [other: string]: any;
}

/** 无参数情形下，返回空数组 - never向下兼容 */
export type EnsureArgumentsType<F extends TkitAjaxFunction> = TkitUtils.GetArgumentsType<
  F
> extends []
  ? [] | never
  : TkitUtils.GetArgumentsType<F>;

/** 仅一个参数情形下，返回第一个参数类型 */
export type EnsureSingleArgumentsType<F extends TkitAjaxFunction> = TkitUtils.GetArgumentsType<
  F
>[1] extends undefined | never
  ? TkitUtils.GetArgumentsType<F>[0]
  : never;

/** 获取第一个参数类型 */

export interface NewAsyncParams<F extends TkitAjaxFunction> extends IAsyncConfirmedMsg {
  /** F 仅接收一个参数适用 */
  params?: EnsureSingleArgumentsType<F>;
  /** 回调 */
  callback?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  /** 取消回调 */
  onCancel?: () => any;
  /** 错误回调 */
  onError?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  /** 成功回调 */
  onSuccess?: (res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => any;
  /** 错误信息，配置成false，则不提示错误信息 */
  errorMsg?: ((res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => React.ReactNode) | React.ReactNode;
  /** 成功信息，配置成false，则不提示成功信息 */
  successMsg?: ((res: TkitUtils.GetReturnTypeOfAsyncFun<F>) => React.ReactNode) | React.ReactNode;
  /** F 接收多个参数适用 - 必须返回数组 */
  paramsGenerator?: (params: NewAsyncParams<F>) => EnsureArgumentsType<F>;
  ASYNC_ID?: number;
  /** 表单情形下返回数据 */
  extraParams?: TkitUtils.GetArgumentsType<F>[0];
  /** 来源 */
  channel?: string;
  /** effect name【tkit-async 3.0.5 起支持】 */
  effectName?: string;
}

export interface IAsyncConfirmedParams<F extends TkitAjaxFunction> extends NewAsyncParams<F> {
  /** 副作用函数 */
  fetch: F;
  /** loading效果，配置成false不显示loading */
  indicator?: React.ReactNode;
  /** 来源 */
  channel?: string;
}

export interface IAsyncActionProps<F extends TkitAjaxFunction> extends NewAsyncParams<F> {
  /** 副作用函数 */
  fetch: F;
  /** Modal弹窗配置 */
  modalProps?: AsyncModalProps;
  /** Form表单配置 */
  formProps?: Partial<AsyncFormProps>;
}

// 单个异步操作
export interface AsyncStatus extends Omit<IAsyncActionProps<TkitAjaxFunction>, 'fetch'> {
  /** 是否已确定 */
  confirmed?: boolean;
  /** 副作用是否正在执行 */
  isFetch?: boolean;
  /** 是否成功 */
  isSuccess?: boolean;
  /** 副作用响应【大概率undefined】 */
  response?: any;
  ASYNC_ID?: number;
  // @IMP: 修改实现之后，需要这个字段来判断是不是弹窗
  /** 是否Modal弹窗 */
  isModal?: boolean;
  /** 控制 Modal 显示、隐藏流程 */
  visible?: boolean;
  // IMP: 自定indicator
  /** 自定义loading效果 */
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
    /** 确认后执行副作用 */
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
    /** 立即执行副作用 */
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
          // IMP: modalProps & formProps
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
    /** 副作用结束 */
    doAsyncEnd: (state, action: Tction<AsyncStatus>): IAsyncState => {
      const {
        ASYNC_ID: id,
        successMsg,
        errorMsg,
        response: responseInAction,
        isSuccess,
        isFetch: forceSetFetchStatus
      } = action.payload;
      return {
        ...state,
        asyncStatus: state.asyncStatus.reduce<AsyncStatus[]>((queue, status) => {
          if (status.ASYNC_ID === id) {
            const {
              successMsg: successMsgInStore,
              errorMsg: errorMsgInStore,
              isFetch,
              isModal,
              response: responseInStore // undefined
            } = status;
            const response = responseInStore || responseInAction;
            const isEffectEnd = isSuccess !== undefined;
            if (isEffectEnd || (isFetch && forceSetFetchStatus !== false)) {
              if (isEffectEnd) {
                const type = isSuccess ? 'success' : 'error';
                const defaultMsg = isSuccess
                  ? (response && response.message) || '操作成功'
                  : (response && response.message) || '操作失败';
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
              }
            }
            if (isModal) {
              queue.push({
                ...status,
                visible: isSuccess === false ? true : false,
                confirmed: false,
                isFetch: false
              });
            }
          } else {
            queue.push(status);
          }
          return queue;
        }, [])
      };
    },
    /** 清理已关闭的 Modal */
    doClearModal: (state): IAsyncState => {
      return {
        ...state,
        asyncStatus: state.asyncStatus.filter(status => status.visible !== false)
      };
    }
  },
  effects: {
    doAsync: [
      async function<F extends TkitAjaxFunction>(
        { tPut }: BaseEffectsUtils,
        action: Tction<Omit<IAsyncActionProps<F>, 'ASYNC_ID'>>
      ) {
        const { modalProps } = action.payload;
        const clear = () => tPut(model.actions.doClearModal);
        await tPut(model.actions.doAsyncStart, {
          ASYNC_ID: 'ASYNC_ID' in action.payload ? action.payload['ASYNC_ID'] : getAsyncId(),
          isModal: true,
          ...action.payload,
          ...(modalProps?.afterClose
            ? {
                modalProps: {
                  afterClose: () => {
                    modalProps?.afterClose && modalProps?.afterClose();
                    clear();
                  }
                }
              }
            : undefined)
        });
      },
      {
        silent: true
      }
    ],
    doAsyncConfirmed: [
      async <F extends TkitAjaxFunction>(
        { tPut }: BaseEffectsUtils,
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
            // eslint-disable-next-line prefer-spread
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
              // eslint-disable-next-line prefer-spread
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
        // TODO: 无响应是不是认为成功？？
        const isSuccess = !(res && res.code);
        const pl: TkitUtils.GetArgumentsType<typeof model.actions.doAsyncEnd>[0] = {
          ASYNC_ID,
          isSuccess,
          response: res
        };
        // IMP: 如果请求被 cancel，则强制取消
        if (res.code === AjaxCancelCode) {
          pl.isFetch = false;
          pl.isSuccess = undefined;
        }
        await tPut(model.actions.doAsyncEnd, pl);
      },
      {
        silent: true
      }
    ],
    doAsyncCancel: [
      async ({ tPut }: BaseEffectsUtils, action: Tction<number>) => {
        await tPut(model.actions.doAsyncEnd, {
          ASYNC_ID: action.payload,
          successMsg: false
        });
      },
      { silent: true }
    ]
  }
});
// IMP: 类型推导遇到泛型不好使了，必须手写类型
export interface AsyncModelActions {
  doAsync: <F extends TkitAjaxFunction>(payload: Omit<IAsyncActionProps<F>, 'ASYNC_ID'>) => any;
  doAsyncConfirmed: <F extends TkitAjaxFunction>(payload: IAsyncConfirmedParams<F>) => any;
  doAsyncCancel: (ASYNC_ID: number) => any;
}

export const asyncModel: Omit<typeof model, 'actions'> & {
  actions: Omit<typeof model.actions, keyof AsyncModelActions> & AsyncModelActions;
} = model as any;

export type AsyncModelType = typeof asyncModel;
