import React from 'react';
import { AsyncFormProps, AsyncModalProps, AsyncStatus } from 'src/asyncModel';
import { AsyncResultEventType } from 'src/consts';

export const loadData = async (id: number) => {
  return { code: 0, message: '', result: { id } };
};
export const loadDataWithMoreParams = async (id: number, name: string) => {
  return { code: 0, message: '', result: { id, name } };
};
export class FormFaker extends React.Component<AsyncFormProps> {
  public constructor(props: AsyncFormProps) {
    super(props);
    if (props.getForm) {
      props.getForm(this);
    }
  }
  public async submit() {
    return {};
  }
  public render() {
    return <div>nihao</div>;
  }
}
export const Modal = (props: AsyncModalProps) => null;
export const tips = (props: AsyncResultEventType) => null;
export const Loading = (props: { status: AsyncStatus }) => null;

// @IMP: type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
export const FormFaker2 = (props: { getForm: number }) => null;
export const Modal2 = (props: { wrong: number }) => null;
export const tips2 = (props: { wrong: number }) => null;
export const Loading2 = (props: { wrong: number }) => null;
