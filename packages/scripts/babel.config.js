module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          ie: '9'
        }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    'react-loadable/babel',
    '@babel/plugin-proposal-object-rest-spread',
    ['import', { libraryName: 'antd', libraryDirectory: process.env.ANTD_LIB_DIR || 'lib' }, 'ant'],
    [
      'import',
      { libraryName: 'antd-mobile', libraryDirectory: process.env.ANTD_MOBILE_LIB_DIR || 'es' },
      'antd-mobile'
    ]
  ]
};
