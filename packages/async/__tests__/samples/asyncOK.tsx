import React from 'react';
import Async from 'src/Async';
import { FormFaker, Loading, Modal, tips } from './consts';

export default function Example() {
  return <Async form={FormFaker} loading={Loading} modal={Modal} tips={tips} />;
}
