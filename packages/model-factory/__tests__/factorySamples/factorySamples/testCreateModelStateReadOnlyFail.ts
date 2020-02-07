import factory from 'src/index';
import { modelWithoutEffectsState } from './states';

factory({
  namespace: 'socketmodelWithoutEffects',
  state: modelWithoutEffectsState,
  reducers: {
    //@cc: 报错，请勿修改，单元测试使用
    doUser: state => {
      state.id = 2; // state 为只读
      return state;
    }
  }
});
