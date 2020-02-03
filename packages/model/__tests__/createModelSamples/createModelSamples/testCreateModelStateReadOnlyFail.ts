import createModel from 'src/createModel';
// import 'src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { modelWithoutEffectsState } from './states';

createModel({
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
