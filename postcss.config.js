const postImport = require('postcss-import');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    postImport({}),
    autoprefixer()
  ]
};
