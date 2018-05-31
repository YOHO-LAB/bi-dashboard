const Controller = require('../framework/controller');
const { BiProjectViews, BiProjectViewsWorksheet, BiProjectViewRoles, BiProjects} = require('../db');
const mdProjectAuth = require('../middleware/project-auth');
const mdViewAuth = require('../middleware/view-auth');
const _ = require('lodash');
const Sequelize = require('sequelize');

class ViewController extends Controller {
  constructor(viewService, worksheetService, databaseFilterService, projectService) {
    super();
    this.viewService = viewService;
    this.worksheetService = worksheetService;
    this.databaseFilterService = databaseFilterService;
    this.projectService = projectService;
  }
  static route() {
    return [
      { path: '/fetch-list', action: 'FetchList', purview: '020505' },
      { path: '/fetch-data', action: 'FetchData', purview: '020505' },
      { path: '/save-data', method: 'post', action: 'SaveData', purview: '020501' },
      { path: '/save-base-data', method: 'post', action: 'SaveBaseData', purview: '020502' },
      { path: '/delete-data', method: 'post', action: 'DeleteData', purview: '020503' },
      { path: '/role-publish', method: 'post', action: 'ViewRolePublish', purview: '020504' },
      { path: '/fetch-dashboard-detail', method: 'post', action: 'FetchDashboardDetail', purview: '020505', befores: [mdProjectAuth] },
      { path: '/fetch-dashboards', method: 'post', action: 'FetchDashboards', purview: '020505', befores: [mdViewAuth] },
      { path: '/fetch-worksheets', action: 'FetchWorksheets', purview: '020505', befores: [mdProjectAuth] },
    ];
  }
  async FetchList(req, res) {
    const queryData = await BiProjectViews.findAll({
      attributes: ['id', 'project_id', 'view_name', 'created_at'],
      where: {
        project_id: req.query.project_id
      }
    });

    res.json({
      code: 200,
      data: queryData
    });
  }
  async FetchDashboards(req, res) {
    let {view_id} = req.body;

    if (!view_id) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    res.setTimeout(1000 * 60 * 5);

    let viewWorksheets = await this.viewService.getViewWorksheets(view_id);

    return res.json({
      code: 200,
      data: _.map(viewWorksheets, w => {
        const worksheet = JSON.parse(w.Worksheet.worksheet_data);

        return {
          worksheet_id: w.worksheet_id,
          worksheet_name: w.Worksheet.worksheet_name,
          worksheetResultType: worksheet.worksheetResultType,
          order: w.view_order
        };
      })
    });
  }
  async FetchDashboardDetail(req, res) {
    const {filters, worksheetId, project_id} = req.body;

    if (!worksheetId && !project_id) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }

    res.setTimeout(1000 * 60 * 5);

    const worksheet = await this.worksheetService.getFullWorksheetData(worksheetId);

    if (!worksheet || !worksheet.ProjectSource || !worksheet.ProjectSource.Database) {
      return res.json({
        code: 400,
        message: 'not found worksheet'
      });
    }
    const worksheet_data = JSON.parse(_.get(worksheet, 'worksheet_data', '{}'));

    if (filters) {
      worksheet_data.filters = filters;
    }

    const data = await this.worksheetService.getDashboardData({
      database: worksheet.ProjectSource.Database,
      source: worksheet.ProjectSource,
      worksheet: {
        values: worksheet_data.values,
        columns: worksheet_data.columns,
        rows: worksheet_data.rows,
        orders: worksheet_data.orders,
        filters: worksheet_data.filters
      }
    });

    return res.json({
      code: 200,
      data: Object.assign({
        worksheet_id: worksheet.id,
        source_id: worksheet.source_id,
        worksheet_name: worksheet.worksheet_name,
        viewData: data,
      }, worksheet_data)
    });
  }
  async FetchData(req, res) {
    let id = _.parseInt(req.query.id || req.query.view_id);

    const model = await BiProjectViews.find({
      include: [{
        model: BiProjectViewRoles,
        as: 'Roles'
      }, {
        model: BiProjects,
        attributes: ['project_name'],
        as: 'Project',
        where: {
          id: Sequelize.col('BiProjectViews.project_id')
        }
      }],
      where: {
        id: id || 0
      }
    });

    if (!model) {
      return res.json({
        code: 400,
        message: '未找到对应的视图'
      });
    }

    return res.json({
      code: 200,
      data: {
        id: model.id,
        view_name: model.view_name,
        roles: _.map(model.Roles, r => r.role_id)
      }
    });
  }
  async SaveData(req, res) {
    const {id, viewData, worksheetResults} = req.body;

    if (!viewData.project_id) {
      return res.json({
        code: 400,
        message: 'not found project id'
      });
    }
    let biData;

    if (id) {
      biData = await BiProjectViews.find({
        where: {
          id,
          project_id: viewData.project_id
        }
      });

      if (!biData) {
        return res.json({
          code: 404,
          message: 'not found view'
        });
      }

      Object.assign(biData, viewData);

      await biData.save();
    } else {
      biData = await BiProjectViews.create(Object.assign(viewData, {create_user: this.$user.userId}));
    }

    let len = worksheetResults.length;

    if (biData.id && len) {
      let works = [];

      // 删除视图工作簿数据
      await BiProjectViewsWorksheet.destroy({where: {view_id: biData.id}});

      // 创建视图工作簿数据,批量插入
      _.each(worksheetResults, (worksheet, index) => {
        works.push({
          view_id: biData.id,
          worksheet_id: parseInt(worksheet.worksheet_id, 10),
          view_order: index
        });
      });

      await BiProjectViewsWorksheet.bulkCreate(works, {fields: ['view_id', 'worksheet_id', 'view_order']});
      works = [];
    }

    return res.json({
      code: 200,
      data: {
        id: biData.id,
        view_name: biData.view_name
      }
    });
  }
  async SaveBaseData(req, res) {
    const {id, view_name} = req.body;

    if (_.isEmpty(view_name) && !id) {
      return res.json({
        code: 400,
        message: 'not found id or name'
      });
    }
    const biData = await BiProjectViews.find({
      where: {
        id
      }
    });

    if (!biData) {
      return res.json({
        code: 404,
        message: 'not found view'
      });
    }
    biData.view_name = view_name;
    await biData.save();

    return res.json({
      code: 200
    });
  }
  async DeleteData(req, res) {
    const {id} = req.body;

    if (!id) {
      return res.json({
        code: 400,
        message: 'not found view id'
      });
    }

    const biData = await BiProjectViews.findById(id);

    if (!biData) {
      return res.json({
        code: 404,
        message: 'view not exists'
      });
    }
    await this.viewService.deleteView(id);

    return res.json({
      code: 200
    });
  }
  async ViewRolePublish(req, res) {
    if (req.body.length > 0) {
      await this.viewService.saveViewRoles(req.body);

      return res.json({
        code: 200,
        data: 'success',
        message: '添加成功！'
      });
    }
  }
  async FetchWorksheets(req, res) {
    const {project_id} = req.query;

    if (!project_id) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }

    const queryData = await this.worksheetService.gets({
      project_id,
    });

    res.json({
      code: 200,
      data: _.map(queryData, worksheet => {
        const data = JSON.parse(worksheet.worksheet_data);

        return {
          id: worksheet.id,
          project_id: worksheet.project_id,
          worksheet_purview: worksheet.worksheet_purview,
          worksheet_name: worksheet.worksheet_name,
          created_at: worksheet.created_at,
          create_user: worksheet.project_id,
          worksheetResultType: data.worksheetResultType
        };
      })
    });
  }
}

module.exports = ViewController;
