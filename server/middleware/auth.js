const {CacheUtil} = require('../utils');
const {injectCreate} = require('../framework/inject');
const RoleService = require('../services/role-service');
const UserService = require('../services/user-service');

module.exports = async(req, res, next) => {
  const {USER_ID} = req.session;

  if (!USER_ID) {
    return res.status(401).json({
      code: 401,
      message: '请登录后继续操作'
    });
  }
  const userService = injectCreate(UserService);
  const user = await userService.get(USER_ID);

  if (!user) {
    return res.status(401).json({
      code: 401,
      message: '找不到对应的用户'
    });
  }
  let purviews = CacheUtil.get(`purview_${user.role_id}`);

  if (!purviews) {
    const roleService = injectCreate(RoleService);

    try {
      const role = await roleService.getRolePurviews(user.role_id);

      if (!role || !role.Purviews.length) {
        return res.status(401).json({
          code: 401,
          message: '当前用户没有权限'
        });
      }
      purviews = role.Purviews;
      CacheUtil.set(`purview_${user.role_id}`, purviews);
    } catch (error) {
      return next(error);
    }
  }

  req.user = {
    userId: USER_ID,
    roleId: user.role_id,
    userInfo: user,
    purviews
  };
  next();
};
