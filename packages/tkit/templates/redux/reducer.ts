import { Action } from '@tkit/actions';

import initialState, { IInitialState } from './initialState';

type Reducer = <P>(state: IInitialState, action: Action<P>) => IInitialState;
const reducers: any[] = [];
export default function reducer<P>(state = initialState, action: Action<P>): IInitialState {
  switch (action.type) {
    // Handle cross-topic actions here
    default:
      state = { ...state };
      break;
  }
  /* istanbul ignore next */
  return reducers.reduce((s, r) => (r as Reducer)(s, action), state);
}
