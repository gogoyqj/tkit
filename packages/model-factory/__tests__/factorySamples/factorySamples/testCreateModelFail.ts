import factory, { Tction } from 'src/index';
import { modelWithoutEffectsState } from './states';

factory({
  namespace: 'socketmodelWithoutEffects',
  state: modelWithoutEffectsState,
  reducers: {
    // 正确
    testNoArguments: state => ({ ...state }),
    testOneArguments: (state, action: Tction<string>) => ({ ...state, name: action.payload }),

    //@cc: 报错，请勿修改，单元测试使用
    testSetWrongStateById: state => ({ ...state, id: '2' }),
    testOneArgumentsByPayloadId: (state, action: Tction<string>) => ({
      ...state,
      id: action.payload
    }),
    testOneArgumentsByPayloadComplexId: (state, action: Tction<{ user: { id: string } }>) => ({
      ...state,
      id: action.payload.user.id
    }),
    testSetWrongStateName: state => ({ ...state, name: 2 }),
    testOneArgumentsByPayloadName: (state, action: Tction<number>) => ({
      ...state,
      name: action.payload
    }),
    testOneArgumentsByPayloadComplexName: (state, action: Tction<{ user: { name: number } }>) => ({
      ...state,
      name: action.payload.user.name
    })
  }
});
