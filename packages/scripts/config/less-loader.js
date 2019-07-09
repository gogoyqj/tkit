module.exports = {
  test: /\.less$/,
  use: [
    require.resolve('style-loader'),
    require.resolve('css-loader'),
    {
      loader: require.resolve('less-loader'),
      options: {
        modifyVars: {
          'primary-color': '#1E80F0',
          'link-color': '#999999',
          // 'success-color': '',
          // 'warning-color': '',
          'error-color': '#FF0000',
          'font-size-base': '14px',
          'heading-color': '#333333',
          'text-color': '#333333',
          'text-color-secondary': '#666',
          'disabled-color ': '#999999',
          'border-radius-base': '2px',
          // 'border-color-base': '',
          // 'box-shadow-base': '',
          'input-bg': '#ffffff',
          'switch-color': '#1E80F0',
          'card-shadow': '0px 0px 10px 0px rgba(129,129,129,0.3)',
          'tag-default-bg': '#ffffff',
          'tag-default-color': '#1E80F0',
          'table-row-hover-bg': 'rgba(238,246,255,0.8)',
          'tooltip-arrow-color': '#ffffff',
          'tooltip-bg': '#ffffff',
          'tooltip-color': '#333333'
        },
        javascriptEnabled: true
      }
    }
  ]
};
