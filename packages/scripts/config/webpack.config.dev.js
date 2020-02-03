/**
 * @file: 通过 config/webpack.config.dev.js 覆盖
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditors: yangqianjun 16:59:13
 * @LastEditTime: 2019-12-09 17:01:49
 */

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { ensureScriptsFile: ensureFile, getTHEME } = require('../lib/consts');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const THEME = getTHEME();
const SITE = process.env.WEBPACK_ALIAS;
const aliasFile = ensureFile(`config/${SITE}-alias.js`);
const aliasConfig = fs.existsSync(aliasFile) ? require(aliasFile) : {};

// eslint-disable-next-line no-console
console.log(`dev with THEME: ${THEME || ''}, ALIAS: ${SITE}`);

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    // en_US: paths.appENUS,
    // zh_CN: paths.appZHCN,
    main: [
      ensureFile('config/polyfills'),
      require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appZHCN, // 先打包到一起
      paths.appIndexJs
    ]
  },
  output: {
    pathinfo: true,
    filename: 'assets/js/[name].js',
    chunkFilename: 'assets/js/[name].chunk.js',
    publicPath: publicPath
  },
  externals: require(ensureFile('config/externals')),
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: [
      '.mjs',
      '.web.ts',
      '.ts',
      '.h5.ts',
      '.web.tsx',
      '.tsx',
      '.h5.tsx',
      '.web.js',
      '.js',
      '.json',
      '.web.jsx',
      '.jsx'
    ],
    alias: {
      'react-native': 'react-native-web',
      ...require('./hack-webpack-alias'),
      ...(aliasConfig.alias || aliasConfig)
    },
    plugins: [
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      new TsconfigPathsPlugin({ configFile: paths.appTsDevConfig })
    ]
  },
  module: {
    strictExportPresence: true,
    rules: [
      // { parser: { requireEnsure: false } },
      require(ensureFile('config/source-map-loader')),
      {
        oneOf: [
          require(ensureFile('config/url-loader')),
          require(ensureFile('config/babel-loader')),
          require(ensureFile('config/tsx-loader'))(paths.appTsDevConfig),
          require(ensureFile('config/less-loader')),
          {
            test: /\.css$/,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1
                }
              },
              require(ensureFile('config/postcss-loader'))
            ]
          },
          require(ensureFile('config/file-loader'))
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      ...env.raw,
      inject: true,
      template: paths.appHtml
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin(env.stringified),
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ForkTsCheckerWebpackPlugin({
      async: false,
      watch: paths.appSrc,
      tsconfig: paths.appTsDevConfig
    })
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  performance: {
    hints: false
  }
};
