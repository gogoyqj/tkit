import { action } from 'typesafe-actions';
import { bindActionCreators as BAC, Dispatch as D } from 'redux';
import { createSelector } from 'reselect';

// @fix: 解决由于 reselect 一份 cache 造成的 actions 更新的问题
export const createBindActionCreators: () => typeof BAC = () =>
  createSelector(
    [<A>(actions: A, dispatch: D) => actions, <A>(actions: A, dispatch: D) => dispatch],
    (actions, dispatch) => BAC(actions, dispatch)
  );
// export const bindActionCreators = createBindActionCreators();
export const bindActionCreators: typeof BAC = createSelector(
  [<A>(actions: A, dispatch: D) => actions, <A>(actions: A, dispatch: D) => dispatch],
  (actions, dispatch) => BAC(actions, dispatch)
);
export const createAction = action;
export { Dispatch } from 'redux';
export * from 'redux-actions';
export { handleActions, Action } from 'redux-actions'; // @fix ts2742 in createModel.ts by export * from 'redux-actions'
export interface ActionWithPayload<P> {
  type: string;
  payload: P;
}
