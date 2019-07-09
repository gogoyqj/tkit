---
name: ajax
menu: 'ajax'
---

# `tkit-ajax`

## Usage

### default

```typescript
import ajax, { TkitAjaxResult, TkitAjaxFunction, AjaxPromise } from 'tkit-ajax';

const res: TkitAjaxFunction = { code: 0, result: { id: 2 } };
const fetchData: TkitAjaxFunction = async () => res;
const fetchData2: () => AjaxPromise<{ code: number; result: { id: number } }> = async () => res;
```

> tips:
> 如果 url 包含 testUser=xxx 的 search 参数，将自动注入到所有 ajax 请求 query 内

### EventCenter

> 全局 401 & 403 错误处理

```typescript
import { EventCenter } from 'tkit-event/lib/event';

EventCenter.on('common.user.status', (res: { code?: number; message?: string }) => {});
```

### axios

> 修改全局配置

```typescript
import axios from 'tkit-ajax/lib/axios';

axios.defaults.headers = {
  ['X-TOKEN']: 'something secret'
};
```
