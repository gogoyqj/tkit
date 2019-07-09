---
name: tkit
menu: '开发/测试/构建'
---

# `npm i -D tkit-tkit`

脚手架 CLI

## Usage

### 创建组件

#### 创建 Component

命名遵循驼峰格式，不能使用 default, index

```shell
# 创建组件 feature/components/componentName
./node_modules/.bin/kit add component feature//componentName

# 创建组件 feature/h5Components/componentName
./node_modules/.bin/kit add component feature/h5/componentName

# 创建组件 feature/componentName
./node_modules/.bin/kit add component feature/componentName

-c : connect redux store
-u : 路由页面，存在 this.props.match.params，组件名请使用 XXXPage
-p : pureComponent
-f : 慎用，覆盖已有
-w : 将组件 ts 与 less 文件包在同一个文件里，默认 false
```

### 创建无状态组件，Presenter、SFC

命名遵循驼峰格式，不能使用 default, index，自动添加 SFC 前缀

```shell
# 创建组件 feature/components/componentName
./node_modules/.bin/kit add presenter feature//componentName

# 创建组件 feature/h5Components/componentName
./node_modules/.bin/kit add presenter feature/h5/componentName

# 创建组件 feature/componentName
./node_modules/.bin/kit add presenter feature/presenterName

-c : connect redux store
-u : 路由页面，存在 props.match.params，组件名请使用 XXXPage
-f : 慎用，覆盖已有
-w : 将组件 ts 与 less 文件包在同一个文件里，默认 false
-k, --hooks : 创建 hooks，默认 false
```

### redux 相关

1. #### 创建 model

命名遵循驼峰格式: xxModel

```
  ./node_modules/.bin/kit add model feature/myModel
```

_TIPS_

- model.state 内数据会直接 merge 到 rootState[feature] 内，务必确保同一 feature 不同 model state 不要有重复的 key，尽量使用带有唯一标识的层级数据结构，如:

```js
  {
    [myModel]: {

    }
  }
```

- 自脚手架版本 _1.3.1_ 起，支持 async effects 及 基于 `useReducer` hooks 的局部 model，局部 model 除不能使用 `redux-saga effects`  外与普通 model 完全兼容

_1.3.0_ async reducers 存在反模式的问题，废弃且禁止使用

model with async reducers

```ts
import { Tction, M } from '@src/utils/useModel';

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

与 `useModel hooks` 一起使用

```ts
import { useModel, bindDispatchToAction } from '@src/utils/useModel';

const MySFCComponent = () => {
  const [store, actions] = useModel(UserModel);
  return (
    <button onClick={() => actions.doFetchName({ time: 2 })}>{store.userModel.username}</button>
  );
};
```

- namespace 会以 `${namespace}/actionName` 自动注入到 dispatch 的 action 中，如果要触发本 model 或者其他 model 的 action:

```ts
  import createModel, { Tction, tPut } from '@src/utils/createModel';
  // @cc: 请直接 import 该 model, 避免产生可能的循环依赖，造成运行时， model 为 undefined
  import otherModel from './otherModel';

  const myModel = createModel({
    effects: *doSomethingAsync({ namespace, put }, action: Tction<{ username: string }>) {
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

2. #### 创建 action - model instead

命名遵循驼峰格式: 动词 + 名词，例如 login，pullUserInfo

实际生成: doLogin, loginReducer

```shell
  ./node_modules/.bin/kit add action feature/actionName
```

3. #### 创建异步 action - model instead

命名遵循驼峰格式: 动词 + 名词，例如 login，pullUserInfo

实际生成 action: doLogin, loginReducer, sagaLogin

```shell
  ./node_modules/.bin/kit add action feature/sagaName -a
```

4. #### 创建适配 antd 分页 list action

命名请: myList - 用以表示分页

```shell
  # 命令请使用 myList 结构
  ./node_modules/.bin/kit add list feature/myList
```

对应 store、actions

```ts
  // 往指定 feature 下写入 myList 数据结构
  {
    [featureName]: {
      [myList]: {
        pageData: [],
        total: 0,
        params: {
          current: 1,
          pageNum: 1,
          pageSize: 10,
          ...params
        },
        rowKey: 'id', // 默认是 id
        selectedRowKeys: [], // 当前选中的行的 rowKeys
        loading: true, // 是否正在加载
        isfetch: true, // 是否正在加载，同 loading
        fetchError: false // 错误信息
      }
    }
  }

  // 往 actions 内写入
  {
    // 拉取翻页数据
    doTestList: (params: Home.ListParams) => xxx
    // 选中行，适配 antd
    doSelectTestList: (payload: {
      // 设置选中
      selectedRowKeys?: IPagenationState['selectedRowKeys'];
      // 指定新的 rowKey
      rowKey?: string | number;
    }) => xxx
    // 此方法预留，需手动写入 actions
    // modifyDataAction: (reducer: (list: List) => List) => xxx
  }
```

5. #### tPut, tCall

typescript 化 redux-saga 的 put & call

```ts
  // 注意： 不要把这里的 effect 和 model 的 effects 混淆，effects 最终会生成 action 并可以供 tPut 调用
  // args 类型必须是 effect 定义的参数类型
  tCall(effect, args: typed)

  // 解决由于使用了 yield 造成 data 类型丢失的问题, use Utils.GetROA for short
  const data: Utils.GetReturnTypeOfAsyncFun<typeof effect> = yield tCall(effect, args);

  // 调用通过 typesafe-actions 创建的 action 以及从 model effects & reducers 自动生成的 action，向下不兼容 redux-actions 创建的 action
  tPut(action, args: typed) - args 类型必须是 action 定义的参数类型
```
