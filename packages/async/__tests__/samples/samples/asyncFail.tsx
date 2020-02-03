import React from 'react';
import Async from 'src/Async';
import { FormFaker2, Loading2, Modal2, tips2 } from './consts';

export default function Example() {
  return <Async form={FormFaker2} loading={Loading2} modal={Modal2} tips={tips2} />;
}
