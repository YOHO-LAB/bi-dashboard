const fs = require('fs');
const sh = require('shelljs');
const path = require('path');

const saveBase64 = (imgData, savePath) => {
  let base64Data = imgData.replace(/^data:image\/[^;]+;base64,/, '');
  let dataBuffer = new Buffer(base64Data, 'base64');

  return new Promise((resolve, reject) => {
    const fileName = path.join(process.cwd(), savePath);
    const filePath = path.dirname(fileName);

    try {
      if (!sh.test('-e', filePath)) {
        sh.mkdir('-p', filePath);
      }

      fs.writeFile(fileName, dataBuffer, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(savePath);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  saveBase64
};
