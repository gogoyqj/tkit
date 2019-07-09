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
    '@babel/plugin-proposal-object-rest-spread'
  ]
};
