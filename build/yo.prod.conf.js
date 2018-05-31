const yoBase = require('./yo.base.conf.js');
const yo = require('yo-cli');

module.exports = yo(yoBase)
  .output({
    publicPath: '/'
  })
  .style({
    extract: true
  })
  .uglify()
  .sourceMap()
  .run();
