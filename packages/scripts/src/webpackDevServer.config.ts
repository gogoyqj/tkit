/**
 * @file: 可通过 config/webpackDevServer.config.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-09 17:24:38
 */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import noopServiceWorkerMiddleware from 'react-dev-utils/noopServiceWorkerMiddleware';
import ignoredFiles from 'react-dev-utils/ignoredFiles';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';

// @todo 等待迁移所有的 config 配置
const paths = require('../config/paths');
const config: webpack.Configuration = require('../config/webpack.config.dev');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';
const proxyCookieSetting: string | undefined = process.env.PROXY_COOKIE || process.env.MY_COOKIE;

export default function configWebpackDevServer(
  proxy: WebpackDevServer.ProxyConfigArrayItem[],
  allowedHost: string
): WebpackDevServer.Configuration {
  // 写入 Cookie
  proxyCookieSetting &&
    (Array.isArray(proxy) ? proxy : proxy ? [proxy] : []).forEach(proxy => {
      proxy.headers = {
        ...proxy.headers,
        ['Cookie']: proxyCookieSetting
      };
    });
  return {
    disableHostCheck: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    compress: true,
    clientLogLevel: 'none',
    contentBase: paths.appPublic,
    watchContentBase: true,
    hot: true,
    publicPath: config.output && config.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: ignoredFiles(paths.appSrc)
    },
    https: protocol === 'https',
    host: host,
    overlay: false,
    historyApiFallback: {
      disableDotRule: true
    },
    public: allowedHost,
    proxy,
    before(app) {
      app.use(errorOverlayMiddleware());
      app.use(noopServiceWorkerMiddleware());
    }
  };
}

// 兼容 require
module.exports = configWebpackDevServer;
