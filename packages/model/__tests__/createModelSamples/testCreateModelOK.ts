import createModel, { Tction, tPut, tCall } from 'src/createModel';
// import 'src/utils/utils'; // @fix: 暂且以此方法猥琐的解决 Utils namespace 未载入的问题
import { modelWithoutEffectsState, modelWithEffectsState } from './states';

export const modelWithoutEffects = createModel({
  namespace: 'socketmodelWithoutEffects',
  state: modelWithoutEffectsState,
  reducers: {
    testNoArguments: state => ({ ...state }),
    testOneArguments: (state, action: Tction<string>) => ({ ...state, name: action.payload })
  }
});

export const modelWithEffects = createModel({
  namespace: 'socketmodelWithoutEffects',
  state: modelWithEffectsState,
  reducers: {
    testNoArguments: state => ({ ...state }),
    testOneArguments: (state, action: Tction<string>) => ({ ...state, name: action.payload })
  },
  effects: {
    *testAsyncNoArguments(): Iterator<any> {
      yield tPut(modelWithEffects.actions.testAsyncNoArguments);
    },
    *testAsyncOneArguments(state, action: Tction<string>): Iterator<any> {
      yield tCall((name: string) => name, action.payload);
      yield tPut(modelWithEffects.actions.testAsyncOneArguments, '');
    }
  }
});

// 测试 TYPES，不应出错
const {
  TYPES: { testNoArguments, testOneArguments, testAsyncNoArguments, testAsyncOneArguments }
} = modelWithEffects;

let StringA: string = testNoArguments;
StringA = testOneArguments;
StringA = testAsyncNoArguments;
StringA = testAsyncOneArguments;

const {
  TYPES: { testNoArguments: testNoArgumentsNoEffects, testOneArguments: testOneArgumentsNoEffects }
} = modelWithoutEffects;

StringA = testNoArgumentsNoEffects;
StringA = testOneArgumentsNoEffects;
