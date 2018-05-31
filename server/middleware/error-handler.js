/**
 * error处理中间件
 * @author: feng.chen<feng.chen@yoho.cn>
 * @date: 2017/10/18
 */
const YoHoException = require('../framework/exception');
const logger = global.yoho.logger;

module.exports.notFound = (req, res, next) => { // eslint-disable-line
  return res.status(404).json({
    code: 404,
  });
};

module.exports.error = (err, req, res, next) => { // eslint-disable-line
  logger.error(err);
  if (err.code === 401) {
    return res.status(401).json({
      code: 401,
      message: '抱歉，您暂未登录！',
      redirect: '/signin.html'
    });
  }
  if (err.code === 404) {
    return res.status(404).json({
      code: 404,
      message: 'Not Found'
    });
  }
  if (err instanceof YoHoException) {
    return res.json({
      code: 400,
      message: err.message.toString()
    });
  }
  return res.status(500).json({
    code: 500,
    message: err && err.toString() || '服务器错误！'
  });

};
