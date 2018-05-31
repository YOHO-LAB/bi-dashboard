const yoBase = require('./yo.base.conf.js');
const yo = require('yo-cli');

module.exports = yo(yoBase)
  .dev({
    port: 8888,
    host: '0.0.0.0',
    hot: true,
    proxy: {
      '/api': 'http://localhost:8887'
    }
  })
  .run();
