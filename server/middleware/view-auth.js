const {injectCreate} = require('../framework/inject');
const ViewService = require('../services/view-serivce');

module.exports = async(req, res, next) => {
  const viewService = injectCreate(ViewService, {$ctx: {req, res}, $user: req.user});
  let viewId = req.query.view_id || req.body.view_id;

  if (!viewId) {
    return res.json({
      code: 400,
      message: '鉴权视图id参数错误'
    });
  }

  try {
    const [auths] = await viewService.checkViewRole(viewId);

    if (auths[0] === +viewId) {
      return next();
    }
    return res.status(401).json({
      code: 999,
      message: '没有该视图的查看权限'
    });
  } catch (error) {
    return next(error);
  }
};
