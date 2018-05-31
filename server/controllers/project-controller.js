const Controller = require('../framework/controller');
const sequelize = require('sequelize');
const _ = require('lodash');
const {BiProjects} = require('../db');

const Op = sequelize.Op;

class ProjectController extends Controller {
  constructor(projectService) {
    super();
    this.projectService = projectService;
  }
  static route() {
    return [
      { path: '/fetch-list', action: 'FetchList', purview: '0207' },
      { path: '/fetch-data', action: 'FetchData', purview: '0207' },
      { path: '/save-data', method: 'post', action: 'SaveData', purview: '0201' },
      { path: '/delete-data', action: 'DeleteData', purview: '0203' },
    ];
  }
  async FetchList(req, res) {
    let {page = 1, size = 10} = req.query;

    page = _.parseInt(page);
    size = _.parseInt(size);

    if (page < 1 || size <= 0 || size > 100) {
      return res.json({
        code: 400
      });
    }
    let where = {};

    if (this.$user.roleId !== 1) {
      where = {
        [Op.or]: [{
          create_user: this.$user.userId
        }, {
          is_public: 1,
          create_role: this.$user.roleId
        }]
      };
    }
    const queryData = await BiProjects.findAndCountAll({
      attributes: Object.keys(BiProjects.attributes).concat([
        [sequelize.literal('(SELECT count(*) FROM `bi_project_worksheets` WHERE `bi_project_worksheets`.`project_id` = `BiProjects`.`id`)'), 'sumWorksheet'],
        [sequelize.literal('(SELECT count(*) FROM `bi_project_views` WHERE `bi_project_views`.`project_id` = `BiProjects`.`id`)'), 'sumView'],
        [sequelize.literal('(SELECT count(*) FROM `bi_project_sources` WHERE `bi_project_sources`.`project_id` = `BiProjects`.`id`)'), 'sumSource'],
        [sequelize.literal(`(SELECT count(distinct bi_project_views.id) FROM bi_project_views LEFT JOIN bi_project_view_roles ON bi_project_views.id = bi_project_view_roles.view_id WHERE (bi_project_views.create_user = ${this.$user.userId} or bi_project_view_roles.role_id = ${this.$user.roleId}) AND bi_project_views.project_id = BiProjects.id)`), 'visibleSumView']
      ]),
      where,
      offset: (page - 1) * size,
      limit: size
    });

    res.json({
      code: 200,
      data: queryData
    });
  }
  async FetchData(req, res) {
    const id = req.query.id;

    if (!id) {
      return res.json({
        code: 400
      });
    }
    const queryData = await BiProjects.find({
      attributes: Object.keys(BiProjects.attributes).concat([
        [sequelize.literal('(SELECT count(*) FROM `bi_project_worksheets` WHERE `bi_project_worksheets`.`project_id` = `BiProjects`.`id`)'), 'sumWorksheet'],
        [sequelize.literal('(SELECT count(*) FROM `bi_project_views` WHERE `bi_project_views`.`project_id` = `BiProjects`.`id`)'), 'sumView'],
        [sequelize.literal('(SELECT count(*) FROM `bi_project_sources` WHERE `bi_project_sources`.`project_id` = `BiProjects`.`id`)'), 'sumSource']
      ]),
      where: {
        id
      }
    });

    res.json({
      code: 200,
      data: queryData
    });
  }
  async SaveData(req, res) {
    const {project_name, project_intro, is_public, id} = req.body;

    if (!project_name || !project_intro) {
      return res.json({
        code: 400
      });
    }
    if (id) {
      const projectData = await BiProjects.find({
        where: {
          id
        }
      });

      if (!projectData) {
        return res.json({
          code: 404,
          message: 'not found project'
        });
      }
      Object.assign(projectData, {
        project_name,
        project_intro,
        is_public,
        create_user: this.$user.userId,
        create_role: this.$user.roleId,
      });
      await projectData.save();

      return res.json({
        code: 200
      });
    } else {
      const result = await BiProjects.create({
        project_name,
        project_intro,
        create_user: this.$user.userId,
        create_role: this.$user.roleId,
        is_public
      });

      res.json({
        code: 200,
        data: result
      });
    }
  }
  async DeleteData(req, res) {
    const id = req.query.id;

    if (!id) {
      return res.json({
        code: 400
      });
    }
    const projectData = await BiProjects.findById(id);

    if (!projectData) {
      return res.json({
        code: 404
      });
    }
    await this.projectService.deleteProject(id);

    return res.json({
      code: 200
    });
  }
}

module.exports = ProjectController;
