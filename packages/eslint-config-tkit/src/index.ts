import base from './base';

module.exports = {
  ...base,
  plugins: [...base.plugins, 'react-hooks'],
  extends: [...base.extends, 'plugin:react/recommended', 'prettier/react'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  settings: {
    ...base.settings,
    react: {
      version: 'detect'
    }
  },
  globals: {
    // jest
    describe: 'readonly',
    it: 'readonly',
    jest: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    // ts
    LocalDataMessages: 'writable'
  },
  rules: {
    ...base.rules,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/display-name': 'off'
  }
};
