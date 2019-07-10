---
name: scripts
menu: '开发/测试/构建'
---

# `npm i -D tkit-scripts`

> dev、build 脚本包

## Usage

### 开发构建

> package.json

```json
{
  ...,
  "scripts": {
    "start": "nodemon node_modules/tkit-scripts/lib/start.js",
    "build": "node node_modules/tkit-scripts/lib/build.js",
    ...
  },
  ...
}
```

### 模板变量 - index.html

> 所有 `REACT_APP_` 或者 `WEBPACK_` 开头的变量以及 PUBLIC_URL 都会通过 `htmlWebpackPlugin.options` 暴露

### 代理设置

> .env.development 或者 .env.development.local

```env
PROXY_TARGET=http://mock.xyz.com/api/
```

### 修改手动 h5 拆包设置 - 如默认配置不能满足需求

> config/h5-alias.js

```js
const h5Alias = require('tkit-scripts/config/h5-alias');

module.exports = {
  ...h5Alias
};
```

> 默认配置 tkit-scripts/config/h5-alias.js

```js
module.exports = {
  './common/routeConfig': './common/h5/routeConfig',
  './rootReducer': './h5/rootReducer',
  'src/common/rootReducer': 'src/common/h5/rootReducer',
  './rootSaga': './h5/rootSaga',
  './styles/index.less': './styles/h5.less'
};
```
