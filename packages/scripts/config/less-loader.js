/* eslint-disable @typescript-eslint/no-var-requires */
const { getTHEME, isProd, ensureScriptsFile } = require('../lib/consts');
const prod = isProd();
const THEME = getTHEME();

const use = [
  require.resolve('css-loader'),
  {
    loader: require.resolve('less-loader'),
    options: {
      modifyVars: require(ensureScriptsFile(`config/colors/${THEME ? THEME : 'default'}`)),
      javascriptEnabled: true,
      compress: prod
    }
  }
];
if (!prod) {
  use.unshift(require.resolve('style-loader'));
}
module.exports = {
  test: /\.less$/,
  use
};
