/**
 * @typedef { import("tkit-service/src/consts").Json2Service } Json2Service
 * @type {Json2Service} 配置
 */
module.exports = {
  url: './swagger.json',
  remoteUrl:
    'https://mock.corp/api/open/plugin/export-full?type=json&pid=442&status=all&token=2bebb6699f123fd9f7f8',
  requestConfig: {
    url: '',
    headers: {}
  },
  type: 'yapi',
  swaggerConfig: {},
  swaggerParser: {
    '-t': 'plugins/typescript-tkit/',
    '-l': 'typescript-angularjs',
    '-o': 'tmp/services'
  },
  validateResponse: true,
  guardConfig: {
    mode: 'strict'
  }
};
