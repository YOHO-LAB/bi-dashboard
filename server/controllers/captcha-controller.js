const Controller = require('../framework/controller');
const geetest = require('../common/geetest');
const logger = global.yoho.logger;


class CaptchaController extends Controller {
  static route() {
    return [
      { path: '/get', action: 'Captcha', auth: false },
    ];
  }
  Captcha(req, res) {
    return geetest.register({
      client_type: 'web'
    }, function(err, data) {
      if (err) {
        logger.error(err);
        return res.json({code: 500});
      }

      if (!data.success) {
        req.session.fallback = true;
        return res.json({
          code: 501,
          data: data
        });
      } else {
        // 正常模式
        req.session.fallback = false;
        return res.send({
          code: 200,
          data: data
        });
      }
    });
  }
}

module.exports = CaptchaController;
