import { useCallback } from 'react';
import { useModel } from 'tkit-model';
import {
  asyncModel,
  IAsyncState,
  AsyncForm,
  AsyncFormProps,
  IAsyncActionProps,
  getAsyncId
} from './asyncModel';

export interface UseAsyncConfig {
  renderForm: (props: AsyncFormProps) => React.ReactChild;
}

// @IMP: 数组类型的痛；私有
export function useAsync(
  config: UseAsyncConfig
): [IAsyncState['asyncStatus'], typeof asyncModel.actions] {
  const [state, actions] = useModel(asyncModel);
  const asyncFormater = useCallback(
    <P extends Omit<IAsyncActionProps<any>, 'ASYNC_ID'>>(payload: P): P => {
      const { modalProps = {}, formProps, onCancel: handleCancel } = payload;
      const ASYNC_ID = getAsyncId();
      let form: AsyncForm | null;
      const newProps = formProps
        ? {
            ...modalProps,
            className: `tkit-async-modal ${modalProps ? modalProps.className : ''}`,
            content: config.renderForm({
              ...formProps,
              getForm: f => {
                form = f;
              }
            }),
            onOk: async () => {
              let values: any;
              if (form) {
                values = await form.submit();
              }
              return values;
            }
          }
        : modalProps;

      if (newProps) {
        const { onCancel, onOk } = newProps;
        newProps.onCancel = async () => {
          if (onCancel) {
            await onCancel();
          }
          await actions.doAsyncCancel(ASYNC_ID || -1);
          await (handleCancel && handleCancel());
        };
        // @IMP: Modal的关闭不再受onOk控制
        newProps.onOk = async () => {
          try {
            let extraParams: any = {};
            if (onOk) {
              extraParams = await onOk();
            }
            await actions.doAsyncConfirmed({
              ASYNC_ID,
              ...payload,
              extraParams
            });
          } catch (e) {
            // do nothing
          }
        };
      }
      return {
        ...payload,
        ASYNC_ID,
        modalProps: newProps
      };
    },
    [actions, config]
  );
  const newActions: typeof actions = {
    ...actions,
    doAsync: payload => {
      return actions.doAsync(asyncFormater(payload));
    }
  };
  return [state.asyncStatus, newActions];
}
