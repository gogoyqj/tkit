/**
 * @file: 通过 config/file-loader.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-09 16:59:13
 */

module.exports = {
  loader: require.resolve('file-loader'),
  exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
  options: {
    name: '[name].[hash:8].[ext]',
    outputPath: 'assets/media'
  }
};
