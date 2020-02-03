import createModel from 'src/createModel';
// import 'src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { modelWithoutEffectsState } from './states';

createModel({
  namespace: 'socketmodelWithoutEffects',
  state: modelWithoutEffectsState,
  reducers: {
    doUser: state => {
      return { ...state };
    }
  }
});
