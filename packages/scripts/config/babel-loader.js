/* eslint-disable @typescript-eslint/no-var-requires */
const { ensureFile } = require('tkit-utils');
const paths = require('./paths');

module.exports = {
  test: /\.(js|jsx|mjs)$/,
  include: [paths.appSrc],
  loader: require.resolve('babel-loader'),
  options: {
    // compact: true,
    configFile: ensureFile('babel.config.js')
  }
};
