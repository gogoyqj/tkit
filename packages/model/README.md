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

tips: 自 @3.0.3 起，默认关闭了 `useModel` 开发阶段运行日志，如需要打印日志，请配置:

```ts
window.__TKIT_USE_MODEL_LOGGER__ = console.log;
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
