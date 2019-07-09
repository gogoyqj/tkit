const momentLocaleRegExp = /\/node_modules\/moment\/locale$/;

module.exports = [
  {
    react: 'React',
    'react-dom': 'ReactDOM',
    redux: 'Redux',
    'react-redux': 'ReactRedux',
    'react-router': 'ReactRouter',
    'react-router-dom': 'ReactRouterDOM',
    'prop-types': 'PropTypes',
    reselect: 'Reselect',
    'redux-saga': 'ReduxSaga',
    'redux-saga/effects': 'ReduxSaga.effects',
    'redux-actions': 'ReduxActions',
    eventemitter3: 'EventEmitter3',
    '@ant-design/icons/lib/dist': 'AntDesignIcons',
    moment: 'moment'
  },
  /**
   * 解决external引入moment之后继续引入语言包导致的重复引入moment和
   * 多个moment实例导致的语言不生效问题
   * 原因：语言包中存在形如 import moment from '../moment' 的声明
   *      webpack在解析'../moment'时不能将 ../moment 识别为external
   *      导致：1、重复引入moment至webpack模块系统内
   *           2、语言包上下文中设置语言的moment实例为webpack模块系统内的moment而非external中的moment(window.moment)
   *              除语言包外的其他模块（比如antd）引用的moment为webpack模块系统内的moment，从而导致设置语言不生效
   * 解决：解析/node_modules/moment/locale（语言包文件）下的 ../moment 识别为external
   */
  function(context, request, callback) {
    if (request === '../moment' && momentLocaleRegExp.test(context)) {
      callback(null, 'moment');
      return;
    }
    callback();
  }
];
