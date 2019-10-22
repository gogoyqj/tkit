---
name: event
menu: 'components'
---

# `npm i tkit-async`

## Usage

### 配置 Async

在最顶层组件内引入 Async，监听并展示 async 事件

```tsx
import React from 'react';
import { Spin, Modal, message } from 'antd';
import Async from 'tkit-async';

// 在最顶级组件内添加
<Async
  form={Form}
  loading={arg => <Spin spinning={arg.status.isFetch} />}
  modal={Modal}
  tips={({ type, message: msg }) => message[type](msg)}
/>;
```

### api

触发 async 事件的接口

```ts
import { doAsync, doAsyncConfirmed } from 'tkit-async';
```

#### 变更

自`3.0.4`起，`doAsync, doAsyncConfirmed`返回`Promise<fetch函数返回值>`
