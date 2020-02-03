/**
 * @file: 通过 config/sass-loader.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditors: yangqianjun 16:59:13
 * @LastEditTime: 2019-12-09 17:01:07
 */

module.exports = {
  test: /\.scss$/,
  use: [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader'
    },
    {
      loader: 'sass-loader'
    }
  ]
};
