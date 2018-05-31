const sh = require('shelljs');
const path = require('path');


const delFile = fileName => {
  if (fileName) {
    fileName = path.join(process.cwd(), '/storage', fileName);

    if (sh.test('-e', fileName)) {
      sh.rm(fileName);
    }
  }
};

module.exports = {
  delFile
};
