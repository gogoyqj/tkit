/**
 * @file: 默认 h5 拆包配置，通过 config/h5-alias.js 配置
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-09 16:59:35
 */

module.exports = {
  './common/routeConfig': './common/h5/routeConfig',
  './rootReducer': './h5/rootReducer',
  'src/common/rootReducer': 'src/common/h5/rootReducer',
  './rootSaga': './h5/rootSaga',
  './styles/index.less': './styles/h5.less'
};
