import React from 'react';
import { Spin, Modal, Button, Input, message } from 'antd';
import 'antd/dist/antd.css';
import { AjaxPromise, TkitAjaxFunction } from 'tkit-ajax';
import Async from '../src/Async';
import {
  AsyncFormProps,
  AsyncStatus,
  AsyncModalProps,
  AsyncForm,
  IAsyncActionProps,
  IAsyncConfirmedParams
} from '../src/asyncModel';
import { doAsync, doAsyncConfirmed } from '../src/';
import { AsyncResultEventType } from '../src/consts';

export class FormFaker extends React.Component<AsyncFormProps> {
  public static fakeData = {
    name: 'skipper'
  };
  public constructor(props: AsyncFormProps) {
    super(props);
    if (props.getForm) {
      props.getForm(this);
    }
  }
  public submit() {
    return FormFaker.fakeData;
  }
  public render() {
    return <div>nihao</div>;
  }
}

const loadData = (id: number): AjaxPromise<any> => {
  console.log('running effect');
  return new Promise((rs, rj) => {
    setTimeout(() => rs({ code: 0, message: '逗我呢', result: { id } }), 1000);
  });
};

export default function Example() {
  return (
    <div>
      <Async
        form={FormFaker}
        loading={arg => <Spin spinning={arg.status.isFetch} />}
        modal={Modal}
        tips={({ type, message: msg }) => message[type](msg)}
      />
      <Button
        onClick={() => {
          doAsync({
            fetch: loadData,
            callback: console.log,
            modalProps: {
              title: 'nihao',
              content: (
                <div>
                  <Input />
                  <Button
                    onClick={() => {
                      doAsync({
                        fetch: loadData,
                        modalProps: {
                          content: '你好',
                          title: '2'
                        }
                      });
                    }}
                  >
                    嵌套了
                  </Button>
                </div>
              )
            }
          });
        }}
      >
        弹窗测试
      </Button>
      &nbsp;
      <Button
        onClick={() => {
          doAsyncConfirmed({
            fetch: loadData,
            callback: console.log
          });
        }}
      >
        不弹窗带loading测试
      </Button>
      &nbsp;
      <Button
        onClick={() => {
          doAsyncConfirmed({
            fetch: loadData,
            callback: console.log,
            indicator: null
          });
        }}
      >
        不显示loading测试
      </Button>
    </div>
  );
}

export function StatusFaker(props: AsyncStatus) {}
export function FormCoreFaker(props: AsyncForm) {}
export function ModalFaker(props: AsyncModalProps) {}
export function ResultTypeFaker(props: AsyncResultEventType) {}
export function AsyncFaker<F extends TkitAjaxFunction>(props: IAsyncActionProps<F>) {}
export function AsyncConfirmedFaker<F extends TkitAjaxFunction>(props: IAsyncConfirmedParams<F>) {}
