const cryptoAES = require('crypto-js/aes');
const encUtf8 = require('crypto-js/enc-utf8');
const cryptoMd5 = require('crypto-js/md5');


let crypto = {
  key: '2dc1bac98e9eb5fc1e2d2ee660536cf4',
  aesEncrypt(plainText) {
    if (typeof plainText === 'object') {
      plainText = encodeURIComponent(JSON.stringify(plainText));
    }
    return cryptoAES.encrypt(plainText, this.key).toString();
  },
  aesDecrypt(cipherText, Type) {
    let bytes = cryptoAES.decrypt(cipherText, this.key);
    let plainText = bytes.toString(encUtf8);

    if (this.getType(Type) === 'Object') {
      return JSON.parse(decodeURIComponent(plainText));
    }
    return plainText;
  },
  md5(plainText) {
    return cryptoMd5(plainText).toString();
  },
  getType(fn) {
    let match = fn && fn.toString().match(/^\s*function (\w+)/);

    return match && match[1];
  }
};

module.exports = crypto;
