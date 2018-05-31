const {injectCreate} = require('../framework/inject');
const ProjectService = require('../services/project-service');

module.exports = async(req, res, next) => {
  const projectService = injectCreate(ProjectService, {$ctx: {req, res}, $user: req.user});
  let projectId = req.query.project_id || req.body.project_id;

  if (!projectId) {
    return res.json({
      code: 400,
      message: '鉴权项目id参数错误'
    });
  }

  try {
    const [auths] = await projectService.checkProjectRole(projectId);

    if (auths[0] === +projectId) {
      return next();
    }
    return res.status(401).json({
      code: 999,
      message: '没有该项目的查看权限'
    });
  } catch (error) {
    return next(error);
  }
};
