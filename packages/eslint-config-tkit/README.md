---
name: eslint-config-tkit
menu: 'spec'
---

# `npm i -D tkit-eslint-config-tkit`

> eslint 规则封装

## Usage

### React 项目

```js
const eslintConfigTkit = require('tkit-eslint-config-tkit');

module.exports = eslintConfigTkit;

// if modify
module.exports = {
  ...eslintConfigTkit,
  globals: {}
};
```

### 无 react

```js
const eslintConfigTkit = require('tkit-eslint-config-tkit/lib/base');

module.exports = eslintConfigTkit;

// if modify
module.exports = {
  ...eslintConfigTkit,
  globals: {}
};
```
