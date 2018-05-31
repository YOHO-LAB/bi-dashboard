const Geetest = require('gt3-sdk');
const config = global.yoho.config;

module.exports = new Geetest({
  geetest_id: config.geetest.id,
  geetest_key: config.geetest.key
});
