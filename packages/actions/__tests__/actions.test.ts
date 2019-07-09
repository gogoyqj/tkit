import { handleActions, createAction, bindActionCreators } from '@src/actions';
import {
  reducer,
  initialStore,
  action,
  actions,
  doNewSetUerName,
  doSetUerName
} from './actionsSamples/actionsOK';

describe('tkit-actions', () => {
  it('should export redux ok', () => {
    expect(typeof bindActionCreators).toEqual('function');
  });

  it('should export typesafe-actions ok', () => {
    expect(typeof createAction).toEqual('function');
    expect(doSetUerName('yqj')).toEqual(doNewSetUerName('yqj'));
    expect(actions.doSetUerName('yqj')).toEqual(action);
  });

  it('should export redux-actions ok', () => {
    expect(typeof handleActions).toEqual('function');
    expect(reducer(initialStore, action)).toMatchObject(action.payload);
  });
});
