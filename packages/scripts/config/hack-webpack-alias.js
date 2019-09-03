// 解决 antd 引入 问题，确保只引入一份
module.exports = {
  antd$: `antd/${process.env.ANTD_LIB_DIR || 'lib'}`,
  'antd-mobile$': `antd-mobile/${process.env.ANTD_MOBILE_LIB_DIR || 'es'}`
};
