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
const { ensureScriptsFile: ensureFile } = require('../lib/consts');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const THEME = process.env.THEME || process.env.WEBPACK_THEME;
const SITE = process.env.WEBPACK_ALIAS;
const aliasFile = ensureFile(`config/${SITE}-alias.js`);
const aliasConfig = fs.existsSync(aliasFile) ? require(aliasFile) : {};

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    en_US: paths.appENUS,
    zh_CN: paths.appZHCN,
    main: [
      ensureFile('config/polyfills'),
      require.resolve('react-dev-utils/webpackHotDevClient'),
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
          THEME === 'yellow'
            ? require(ensureFile('config/yellow-less-loader'))
            : require(ensureFile('config/less-loader')),
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
