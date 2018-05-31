import cryptoAES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';
import cryptoMd5 from 'crypto-js/md5';


let crypto = {
  key: 'd7b7ac4b491fd2b1b9e27bc2ca9bf5d0',
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

export default crypto;
