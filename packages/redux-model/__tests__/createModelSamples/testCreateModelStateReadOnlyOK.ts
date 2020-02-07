import factory from 'src/index';
import { modelWithoutEffectsState } from './states';

factory({
  namespace: 'socketmodelWithoutEffects',
  state: modelWithoutEffectsState,
  reducers: {
    doUser: state => {
      return { ...state };
    }
  }
});
