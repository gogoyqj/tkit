---
name: typescript-config
menu: '开发/测试/构建'
---

# `npm i -D tkit-typescript-config`

> typescript 配置封装

## Usage

> tsconfig.json

```json
{
  "extends": "tkit-typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "src",
    "module": "esnext",
    "target": "es3",
    "outDir": "build",
    "importHelpers": true,
    "typeRoots": ["node_modules/@types", "src/**/*.d.ts", "*.d.ts"],
    "paths": {
      "@src/*": ["src/*"],
      "@features/*": ["src/features/*"],
      "@services/*": ["src/services/*"],
      "@AuthContext": ["src/features/home/components/AuthContext"],
      "@ajax": ["node_modules/tkit-ajax"]
    }
  }
}
```
