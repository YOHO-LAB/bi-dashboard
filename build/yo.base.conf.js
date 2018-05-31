const yo = require('yo-cli');
const path = require('path');

module.exports = yo()
  .entry('./app/app.js')
  .style({
    preLoaders: {
      scss: true
    }
  })
  .resolve({
    alias: {
      'create-api': 'common/create-api',
      config: 'common/config'
    },
    modules: [
      path.join(__dirname, '../app'),
      'node_modules'
    ]
  })
  .js({
    babel: {
      include: [
        path.join(__dirname, '../app'),
        path.join(__dirname, '../node_modules/vue-echarts'),
        path.join(__dirname, '../node_modules/resize-detector'),
      ]
    }
  })
  .vue({
    loaders: [
      {
        loader: 'iview-loader',
        options: {
          prefix: true
        }
      }
    ]
  });
