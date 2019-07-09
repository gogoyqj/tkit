import createModel, { tCall, tPut, Tction } from '@src/createModel';
// import '@src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { modelWithEffectsState } from './states';

const testModelWithEffects = createModel({
  namespace: 'socketmodelWithoutEffects',
  state: modelWithEffectsState,
  reducers: {
    testNoArguments: state => ({ ...state }),
    testOneArguments: (state, action: Tction<string>) => ({ ...state, name: action.payload })
  },
  effects: {
    *testAsyncNoArguments(): Iterator<any> {
      yield tPut(testModelWithEffects.actions.testAsyncNoArguments);
    },
    *testAsyncOneArguments(state, action: Tction<string>): Iterator<any> {
      yield tCall((name: string) => name, action.payload);
      yield tPut(testModelWithEffects.actions.testAsyncOneArguments, '');
    }
  }
});
