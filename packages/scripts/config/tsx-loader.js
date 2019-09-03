// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
/* eslint-disable @typescript-eslint/no-var-requires */
const tsImportPluginFactory = require('ts-import-plugin');

const paths = require('./paths');

module.exports = function(configFile) {
  return {
    // Compile .tsx?
    test: /\.(ts|tsx)$/,
    include: paths.appSrc,
    use: [
      {
        loader: require.resolve('ts-loader'),
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true,
          configFile: configFile,
          getCustomTransformers: () => ({
            before: [
              tsImportPluginFactory({
                libraryName: 'antd',
                libraryDirectory: process.env.ANTD_LIB_DIR || 'lib',
                style: true,
                resolveContext: [path.join(process.cwd(), 'node_modules')]
              }),
              tsImportPluginFactory({
                libraryName: 'antd-mobile',
                libraryDirectory: process.env.ANTD_MOBILE_LIB_DIR || 'es',
                style: true,
                resolveContext: [path.join(process.cwd(), 'node_modules')]
              })
            ]
          })
        }
      }
    ]
  };
};
