---
name: event
menu: 'components'
---

# `npm i tkit-async`

## Usage

### 配置 Async

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

```ts
import { doAsync, doAsyncConfirmed } from 'tkit-async';
```
