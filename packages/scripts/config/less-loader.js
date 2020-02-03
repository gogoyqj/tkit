/**
 * @file: 通过 config/less-loader.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-09 17:00:03
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { getTHEME, isProd, ensureScriptsFile } = require('../lib/consts');
const prod = isProd();
const THEME = getTHEME();

const use = [
  require.resolve('css-loader'),
  require(ensureScriptsFile('config/postcss-loader')),
  {
    loader: require.resolve('less-loader'),
    options: {
      modifyVars: require(ensureScriptsFile(`config/colors/${THEME ? THEME : 'default'}`)),
      javascriptEnabled: true,
      compress: prod
    }
  }
];
if (!prod) {
  use.unshift(require.resolve('style-loader'));
}
module.exports = {
  test: /\.less$/,
  use
};
