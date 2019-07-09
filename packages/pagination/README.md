---
name: pagination
menu: 'redux'
---

# `npm i tkit-pagination`

> 全局 redux pagination 封装

## Usage

```js
import { pagination } from 'tkit-pagination';

const { START, SUCCESS, initialState, reducer, action, selectAction, saga } = pagination(
  'useList',
  { pageSize: 20 },
  api.api.queryUser,
  'id',
  'admin'
);
```
