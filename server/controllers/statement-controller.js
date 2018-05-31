const Controller = require('../framework/controller');
const mdViewAuth = require('../middleware/view-auth');
const {
  BiProjectViews, BiProjectViewRoles, BiProjects, BiProjectWorksheets,
  BiProjectViewsWorksheet, BiProjectSources, BiDatabases, BiProjectSourceFields, BiProjectSourceTableRelations,
  BiProjectSourceTableRelationConditions, BiProjectSourceTables
} = require('../db');
const _ = require('lodash');
const Sequelize = require('sequelize');
const {WorksheetProcess, ExcelUtil} = require('../utils');

class StatementController extends Controller {
  constructor(viewService, worksheetService, databaseFilterService, statementService) {
    super();
    this.viewService = viewService;
    this.worksheetService = worksheetService;
    this.databaseFilterService = databaseFilterService;
    this.statementService = statementService;
  }
  static route() {
    return [
      { path: '/fetch-views', action: 'FetchViews', purview: '020506'},
      { path: '/fetch-project-view-list', action: 'FetchStatementViewList', purview: '020506'},
      { path: '/fetch-data', action: 'FetchData', purview: '020506'},
      { path: '/fetch-dashboards', method: 'post', action: 'FetchDashboards', purview: '020506', befores: [mdViewAuth]},
      { path: '/fetch-dashboard-detail', method: 'post', action: 'FetchDashboardDetail', purview: '020506', befores: [mdViewAuth] },
      { path: '/fetch-statement-worksheets', action: 'FetchWorksheets', purview: '020506' },
      { path: '/fetch-worksheet-result', method: 'post', action: 'FetchWorksheetResult', purview: '020506' },
      { path: '/fetch-statement-project-views', action: 'FetchStatementProjectViews', purview: '020506' },
      { path: '/fetch-statement-projects', action: 'FetchStatementProjects', purview: '020506' },
      { path: '/output-dashboard', method: 'post', action: 'OutputDashboard', purview: '020506'},
    ];
  }
  async FetchStatementProjects(req, res) {
    let {page = 1, size = 10} = req.query;

    page = _.parseInt(page);
    size = _.parseInt(size);

    if (page < 1 || size <= 0 || size > 100) {
      return res.json({
        code: 400
      });
    }
    let where = {};

    const queryData = await BiProjects.findAndCountAll({
      attributes: Object.keys(BiProjects.attributes).concat([
        [Sequelize.literal(`(SELECT count(distinct bi_project_views.id) FROM bi_project_views LEFT JOIN bi_project_view_roles ON bi_project_views.id = bi_project_view_roles.view_id WHERE (bi_project_views.create_user = ${this.$user.userId} or bi_project_view_roles.role_id = ${this.$user.roleId}) AND bi_project_views.project_id = BiProjects.id)`), 'visibleSumView']
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
  async FetchViews(req, res) {
    let {page = 1, size = 10} = req.query;

    page = _.parseInt(page);
    size = _.parseInt(size);

    if (page < 1 || size <= 0 || size > 100) {
      return res.json({
        code: 400,
        message: 'invalid page number or page size'
      });
    }

    const result = await BiProjectViews.findAndCountAll({
      attributes: ['id', 'view_name', 'created_at', 'create_user'],
      include: {
        model: BiProjects,
        as: 'Project',
        where: {
          id: Sequelize.col('BiProjectViews.project_id')
        }
      },
      where: Sequelize.literal(`exists (select * from bi_project_view_roles where BiProjectViews.id =
                bi_project_view_roles.view_id and bi_project_view_roles.role_id = ${this.$user.roleId})`),
      order: [['created_at', 'DESC']],
      offset: (page - 1) * size,
      limit: size
    });

    res.json({
      code: 200,
      data: result
    });
  }
  async FetchStatementProjectViews(req, res) {
    const projectData = await BiProjects.findOne({
      where: {
        id: req.query.project_id
      }
    });

    let {page = 1, size = 10} = req.query;

    page = _.parseInt(page);
    size = _.parseInt(size);

    if (page < 1 || size <= 0 || size > 100) {
      return res.json({
        code: 400,
        message: 'invalid page number or page size'
      });
    }

    const result = await BiProjectViews.findAndCountAll({
      attributes: ['id', 'view_name', 'created_at', 'create_user'],
      where: Sequelize.literal(`exists (select * from bi_project_view_roles
                where BiProjectViews.project_id = ${req.query.project_id} and BiProjectViews.id =
                bi_project_view_roles.view_id and bi_project_view_roles.role_id = ${this.$user.roleId})`),
      order: [['created_at', 'DESC']],
      offset: (page - 1) * size,
      limit: size
    });

    result.project_name = projectData.project_name;
    res.json({
      code: 200,
      data: result
    });
  }
  async FetchData(req, res) {
    let id = _.parseInt(req.query.view_id);

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
        message: 'project has been deleted'
      });
    }

    return res.json({
      code: 200,
      data: {
        id: model.id,
        project_id: model.project_id,
        project_name: model.Project.project_name,
        view_name: model.view_name,
      }
    });
  }
  async FetchResultData(req, res) {
    let {view_id, worksheet_ids} = req.body;

    let worksheetResults = [];
    let worksheets;

    if (!(view_id || worksheet_ids)) {
      return res.json({
        code: 400,
        data: [],
        message: 'view_id OR worksheet_ids All Are empty'
      });
    }
    res.setTimeout(1000 * 60 * 5);

    if (view_id) {
      let queryData = await BiProjectViewsWorksheet.findAll({
        attributes: ['id'],
        include: [{
          model: BiProjectWorksheets,
          as: 'ProjectWorksheets',
          include: [{
            model: BiProjectSources,
            attributes: ['source_table', 'source_type', 'source_sql'],
            as: 'ProjectSource',
            include: [{
              model: BiDatabases,
              as: 'Database'
            }, {
              model: BiProjectSourceFields,
              as: 'Columns'
            }, {
              model: BiProjectSourceTableRelations,
              as: 'Relations',
              include: [{
                model: BiProjectSourceTableRelationConditions,
                as: 'Conditions'
              }]
            }, {
              model: BiProjectSourceTables,
              as: 'Tables'
            }]
          }],
        }],
        where: {
          view_id,
        },
        order: [['view_order', 'DESC']]
      });

      worksheets = _.map(queryData, item => {
        return item.ProjectWorksheets;
      });
    } else {
      worksheets = await BiProjectWorksheets.findAll({
        include: [{
          model: BiProjectSources,
          attributes: ['id', 'source_type', 'source_sql'],
          as: 'ProjectSource',
          include: [{
            model: BiDatabases,
            as: 'Database'
          }, {
            model: BiProjectSourceFields,
            as: 'Columns'
          }, {
            model: BiProjectSourceTableRelations,
            as: 'Relations',
            include: [{
              model: BiProjectSourceTableRelationConditions,
              as: 'Conditions'
            }]
          }, {
            model: BiProjectSourceTables,
            as: 'Tables'
          }]
        }],
        where: {
          id: worksheet_ids
        },
        order: [['id', 'DESC']]
      });
    }

    if (_.isEmpty(worksheets)) {
      return res.json({
        code: 400,
        data: [],
        message: 'worksheets is empty'
      });
    }

    for (let i = 0; i < worksheets.length; i++) {
      let item = worksheets[i];
      let worksheet_data = JSON.parse(_.get(item, 'worksheet_data', '{}'));
      let database = _.get(item, 'ProjectSource.Database', {});
      let projectSource = _.get(item, 'ProjectSource', {});

      // 过滤不存在的数据
      if (_.isEmpty(database) ||
                _.isEmpty(worksheet_data) ||
                (_.isEmpty(worksheet_data.rows) && _.isEmpty(worksheet_data.values))
      ) {
        continue;
      }
      const databaseFilter = await this.databaseFilterService.getUserDatabaseFilter(database);
      const dbAdapter = new WorksheetProcess({
        database,
        source: projectSource,
        dbfilter: databaseFilter
      });
      const data = await dbAdapter.execute({
        values: worksheet_data.values,
        columns: worksheet_data.columns,
        rows: worksheet_data.rows,
        orders: worksheet_data.orders,
        filters: worksheet_data.filters
      });

      dbAdapter.close();

      worksheetResults.push(Object.assign({
        worksheet_id: item.id,
        source_id: item.source_id,
        worksheet_name: item.worksheet_name,
        viewData: data,
        worksheetResultType: 'table',
      }, worksheet_data));
    }

    res.json({
      code: 200,
      data: worksheetResults
    });
  }
  async FetchWorksheets(req, res) {
    const queryData = await BiProjectWorksheets.findAll({
      attributes: ['id', 'project_id', 'worksheet_purview', 'worksheet_name', 'created_at', 'create_user'],
      where: {
        project_id: req.query.project_id,
      }
    });

    res.json({
      code: 200,
      data: queryData
    });
  }
  async FetchWorksheetResult(req, res) {
    const {values, columns, rows, orders, filters, id, source_id} = req.body;

    if (_.isEmpty(rows) && _.isEmpty(values)) {
      return res.json({
        code: 400
      });
    }
    res.setTimeout(1000 * 60 * 5);
    let projectSource, database;

    if (id) {
      const worksheetData = await this.worksheetService.getFullWorksheetData(id);

      if (!worksheetData || !worksheetData.ProjectSource || !worksheetData.ProjectSource.Database) {
        return res.json({
          code: 400,
          message: 'not found worksheet'
        });
      }
      projectSource = worksheetData.ProjectSource;
      database = worksheetData.ProjectSource.Database;
    } else {
      const projectSourceData = await this.sourceService.getFullSourceData(source_id);

      if (!projectSourceData || !projectSourceData.Database) {
        return res.json({
          code: 400,
          message: 'not found projectSource'
        });
      }
      projectSource = projectSourceData;
      database = projectSourceData.Database;
    }
    const databaseFilter = await this.databaseFilterService.getUserDatabaseFilter(database);
    const dbAdapter = new WorksheetProcess({
      database,
      source: projectSource,
      dbfilter: databaseFilter
    });
    const data = await dbAdapter.execute({values, columns, rows, orders, filters});

    return res.json({
      code: 200,
      data: data
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
    const {filters, worksheetId, view_id} = req.body;

    if (!worksheetId) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }

    res.setTimeout(1000 * 60 * 5);
    const existWorksheet = await this.statementService.checkWorksheetByView(worksheetId, view_id);

    if (!existWorksheet) {
      return res.json({
        code: 404,
        message: '找不到对应的视图'
      });
    }

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
  async OutputDashboard(req, res) {
    const {worksheetId, filters} = req.body;

    if (!worksheetId) {
      return res.json({
        code: 404,
        message: '参数错误'
      });
    }
    res.setTimeout(1000 * 60 * 5);
    const worksheetData = await this.worksheetService.getFullWorksheetData(worksheetId);

    if (!worksheetData || !worksheetData.ProjectSource || !worksheetData.ProjectSource.Database) {
      return res.json({
        code: 400,
        message: 'not found worksheet'
      });
    }
    const worksheet_name = worksheetData.worksheet_name;
    const projectSource = worksheetData.ProjectSource;
    const database = worksheetData.ProjectSource.Database;
    const worksheetJson = JSON.parse(worksheetData.worksheet_data);

    worksheetJson.filters = filters; // 视图可以修改过滤条件

    const databaseFilter = await this.databaseFilterService.getUserDatabaseFilter(database);
    const dbAdapter = new WorksheetProcess({
      database,
      source: projectSource,
      dbfilter: databaseFilter
    });
    const data = await dbAdapter.execute(worksheetJson);

    dbAdapter.close();

    const buffer = ExcelUtil.exportExcel(worksheetJson.rows, worksheetJson.columns, worksheetJson.values, data, worksheet_name);

    res.setHeader('Content-Type', 'application/msexcel');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(worksheet_name)}.xlsx`);
    return res.end(buffer, 'binary');
  }
}

module.exports = StatementController;
