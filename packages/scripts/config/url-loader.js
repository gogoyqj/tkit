/**
 * @file: 通过 config/url-loader.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditors: yangqianjun 16:59:13
 * @LastEditTime: 2019-12-09 17:01:36
 */

module.exports = {
  test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
  loader: require.resolve('url-loader'),
  options: {
    limit: 10000,
    name: '[name].[hash:8].[ext]',
    outputPath: 'assets/media'
  }
};
