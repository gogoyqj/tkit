module.exports = {
  test: /\.less$/,
  use: [
    require.resolve('style-loader'),
    require.resolve('css-loader'),
    {
      loader: require.resolve('less-loader'),
      options: {
        modifyVars: {
          'info-color': '#FF8000',
          'primary-color': '#FF8000',
          'link-color': '#999999',
          // 'success-color': '',
          // 'warning-color': '',
          'error-color': '#FF0000',
          'heading-color': '#333333',
          'text-color': '#333333',
          'text-color-secondary': '#666',
          'disabled-color ': '#999999',
          'border-radius-base': '2px',
          // 'border-color-base': '',
          // 'box-shadow-base': '',
          'input-bg': '#fff',
          'switch-color': '#FF8000',
          'card-shadow': '0px 0px 10px 0px rgba(129,129,129,0.3)',
          'tag-default-bg': '#fff',
          'tag-default-color': '#FF8000',
          'item-hover-bg': '#fbfbfb',
          'table-row-hover-bg': '#fbfbfb',
          'font-size-base': '14px',
          'tooltip-arrow-color': '#ffffff',
          'tooltip-bg': '#ffffff',
          'tooltip-color': '#333333',
          'k-layout-bg': ' #f5f5f5',
          // background
          'k-layout-header-bg': ' #ffffff',
          'k-layout-content-bg': ' #f3f4f5',
          'k-empty-bg': ' #ffffff',
          'k-disabled-bg': ' #eeeeee',
          'k-form-bg': ' #f9f9f9',

          // text-color
          'disabled-color': ' #999999',
          'text-color-active': ' #ff8000',

          // border
          'border-radius-base-secondary': ' 4px', // for button and so on
          'border-radius-base-3rd': ' 6px', // for button and so on
          'border-color-base': ' #dddddd',
          'border-color-base-secondary': ' #eeeeee'
        },
        javascriptEnabled: true
      }
    }
  ]
};
