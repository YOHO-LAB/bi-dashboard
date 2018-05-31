const geetest = require('../common/geetest');
const config = global.yoho.config;

module.exports = (req, res, next) => {
  let verifyCode = req.body.captcha || '';

  if (!config.useGeetest) {
    return next();
  }
  if (!verifyCode) {
    return res.send({
      code: 405,
      message: '请输入验证码'
    });
  }

  geetest.validate(req.session.fallback, {
    geetest_challenge: verifyCode[0],
    geetest_validate: verifyCode[1],
    geetest_seccode: verifyCode[2]
  }, function(err, success) {
    if (err) {
      return res.send({
        message: '网络错误',
        code: 405
      });
    } else if (!success) {
      return res.send({
        message: '图形验证失败',
        code: 405
      });
    } else {
      return next();
    }
  });
};
