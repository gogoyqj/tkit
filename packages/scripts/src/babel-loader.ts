import * as path from 'path';
import { ensureFile } from 'tkit-utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const paths = require('../config/paths');

module.exports = {
  test: /\.(js|jsx|mjs)$/,
  include: [paths.appSrc],
  loader: require.resolve('babel-loader'),
  options: {
    // compact: true,
    configFile: ensureFile('babel.config.js', path.join(__dirname, '..'))
  }
};
