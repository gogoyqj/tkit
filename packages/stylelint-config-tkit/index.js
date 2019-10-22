module.exports = {
  extends: 'stylelint-config-recommended',
  rules: {
    // @TODO: 暂时关闭这条配置
    // 'selector-class-pattern': '^[a-z]+([a-z0-9-_]+)?$',
    'string-quotes': 'single',
    'selector-max-id': 0
  }
};
