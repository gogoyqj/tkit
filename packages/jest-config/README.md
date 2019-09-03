---
name: jest-config
menu: '开发/测试/构建'
---

# `npm i -D tkit-jest-config`

> tkit jest 配置封装

## Usage

```js
const jestConfig = require('tkit-jest-config');

module.exports = jestConfig;
```

## Config

### 配置 `polyfill.js`

创建 `config/polyfill.js`

```js
require('tkit-config/polyfills.js');
// do something
```

### 配置初始化逻辑

创建 `__tests__/setup.ts` `__tests__/setup.js` 任一皆可

例如初始化 enzyme react 环境

```ts
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
```
