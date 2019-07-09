/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { ensureScriptsFile: ensureFile } = require('../lib/consts');
const paths = require('./paths');
const getClientEnvironment = require('./env');

const publicPath = paths.servedPath;
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

const THEME = process.env.THEME || process.env.WEBPACK_THEME;
const SITE = process.env.WEBPACK_ALIAS;
const aliasFile = ensureFile(`config/${SITE}-alias.js`);
const aliasConfig = fs.existsSync(aliasFile) ? require(aliasFile) : {};
module.exports = {
  mode: 'development', // production 用 production 有潜在问题
  bail: true,
  devtool: shouldUseSourceMap ? 'source-map' : false,
  entry: {
    en_US: paths.appENUS,
    zh_CN: paths.appZHCN,
    main: [ensureFile('config/polyfills'), paths.appIndexJs]
  },
  output: {
    path: paths.appBuild,
    filename: 'assets/js/[name].[chunkhash:8].js',
    chunkFilename: 'assets/js/[name].[chunkhash:8].chunk.js',
    publicPath: publicPath,
    devtoolModuleFilenameTemplate: info =>
      path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
  },
  externals: require(ensureFile('config/externals')),
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        antd: {
          test: /[\\/]node_modules[\\/](?!quill)/,
          name: 'antd',
          chunks: 'initial',
          priority: -10
        }
      }
    }
  },
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
      new TsconfigPathsPlugin({ configFile: paths.appTsProdConfig })
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
          require(ensureFile('config/tsx-loader'))(paths.appTsProdConfig),
          THEME === 'yellow'
            ? require(ensureFile('config/yellow-less-loader'))
            : require(ensureFile('config/less-loader')),
          {
            test: /\.css$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: publicPath
                }
              },
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  minimize: true,
                  sourceMap: shouldUseSourceMap
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
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new webpack.NamedModulesPlugin(),
    new CaseSensitivePathsPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name]_[chunkhash].css',
      chunkFilename: 'assets/css/[name]_[chunkhash].css'
    }),
    new webpack.DefinePlugin(env.stringified),
    new UglifyJsPlugin({
      uglifyOptions: {
        parse: {
          ecma: 8
        },
        compress: {
          ecma: 5,
          warnings: false,
          comparisons: false,
          drop_console: {
            pure_funcs: ['console.log']
          }
        },
        mangle: {
          safari10: true
        },
        output: {
          ecma: 5,
          comments: false,
          ascii_only: true
        }
      },
      parallel: true,
      cache: true,
      sourceMap: shouldUseSourceMap
    }),
    new ManifestPlugin({
      fileName: 'asset-manifest.json'
    }),
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          return;
        }
        if (message.indexOf('Skipping static resource') === 0) {
          return;
        }
        console.log(message);
      },
      minify: true,
      navigateFallback: publicUrl + '/index.html',
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/]
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', generateStatsFile: true }),
    new ForkTsCheckerWebpackPlugin({
      async: false,
      tsconfig: paths.appTsProdConfig,
      tslint: false
    })
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
};
