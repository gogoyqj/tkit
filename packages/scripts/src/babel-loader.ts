/**
 * @file: 通过 config/babel-loader.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-08-05 21:52:09
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-09 16:53:27
 */

import * as path from 'path';
import { ensureFile } from 'tkit-utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const paths = require('../config/paths');

module.exports = {
  test: /\.(js|jsx|mjs)$/,
  include: [paths.appSrc],
  loader: require.resolve('babel-loader'),
  options: {
    // compact: true,
    configFile: ensureFile('babel.config.js', path.join(__dirname, '..'))
  }
};
