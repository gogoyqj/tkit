---
name: model
menu: 'redux'
---

# `npm i tkit-model`

> tkit createModel / useModel 封装

## Usage

### 适配别名 - webpack alias 或者 tsconfig path

> @src/store - 将其适配至 redux 全局 store

```ts
  export default createStore({ ... });
```

### M

> 创建供 `useModel` 使用的局部 model

```ts
import { Tction, M } from 'tkit-model';

export const UserModel = M({
  namespace: 'test',
  state: {
    userModel: {
      username: ''
    }
  },
  reducers: {
    doRename: (state, action: Tction<{ username: string }>) => {
      return {
        ...state,
        userModel: {
          ...state.userModel,
          ...action.payload.username
        }
      };
    }
  },
  effects: {
    doFetchName: async ({ tPut }, action: Tction<{ time: number }>): Promise<{}> => {
      const username = await new Promise(rs => rs(`me${action.payload.time}`));
      return tPut(UserModel.actions.doRename, { username });
    }
  }
});
```

### useModel hooks

> 在 hooks 内使用 model

```ts
import { useModel, bindDispatchToAction } from 'tkit-model';

const MySFCComponent = props => {
  const [store, actions] = useModel(UserModel, props.data);
  return (
    <button onClick={() => actions.doFetchName({ time: 2 })}>{store.userModel.username}</button>
  );
};
```

### createModel

> 创建全局 redux model

```ts
import createModel, { Tction }  from 'tkit-model';
import otherModel from './otherModel';

const myModel = createModel({
  effects: *doSomethingAsync({ namespace, put, tPut }, action: Tction<{ username: string }>) {
    // 触发其他 model action
    // way 1, rec
    yield tPut(otherModel.actions.actionsNameA, { username: '' });
    // way 2
    yield put({ type: otherModel.TYPES.actionsNameA, payload: { username: '' } });

    // 出发本 model action
    // way 1, rec
    yield tPut(myModel.actions.actionsNameA, { username: '' });
    // way 2
    yield put({ type: myModel.TYPES.actionsNameA, payload: { username: '' } });
    // way 3
    yield put({ type: `${namespace}/actionsNameA`, payload: { username: '' } });
  }
})
```
