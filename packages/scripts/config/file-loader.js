module.exports = {
  loader: require.resolve('file-loader'),
  exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
  options: {
    name: '[name].[hash:8].[ext]',
    outputPath: 'assets/media'
  }
};
