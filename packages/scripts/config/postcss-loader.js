/**
 * @file: 通过 config/postcss-loader.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditors: yangqianjun 16:59:13
 * @LastEditTime: 2019-12-09 17:00:54
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const autoprefixer = require('autoprefixer');

module.exports = {
  loader: require.resolve('postcss-loader'),
  options: {
    ident: 'postcss',
    plugins: () => [
      require('postcss-flexbugs-fixes'),
      autoprefixer({
        flexbox: 'no-2009',
        overrideBrowserslist: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9' // React doesn't support IE8 anyway
        ]
      })
    ]
  }
};
