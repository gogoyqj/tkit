/**
 * @file: 通过 config/sourcemap-loader.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditors: yangqianjun 16:59:13
 * @LastEditTime: 2019-12-09 17:01:15
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const paths = require('./paths');

module.exports = {
  test: /\.(js|jsx|mjs)$/,
  loader: require.resolve('source-map-loader'),
  enforce: 'pre',
  include: paths.appSrc
};
