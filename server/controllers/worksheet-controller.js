const Controller = require('../framework/controller');
const {BiProjectWorksheets} = require('../db');
const _ = require('lodash');
const uuid = require('uuid');
const {ImageUtil, ExcelUtil, FileUtil} = require('../utils');

class WorksheetController extends Controller {
  constructor(worksheetService, sourceService, databaseFilterService) {
    super();
    this.worksheetService = worksheetService;
    this.sourceService = sourceService;
    this.databaseFilterService = databaseFilterService;
  }
  static route() {
    return [
      { path: '/fetch-result', method: 'post', action: 'FetchResultData', purview: '020404' },
      { path: '/statement/fetch-result', method: 'post', action: 'FetchResultData', purview: '020506' },
      { path: '/fetch-list', action: 'FetchList', purview: '020404' },
      { path: '/fetch-data', action: 'FetchData', purview: '020404' },
      { path: '/save-data', method: 'post', action: 'SaveData', purview: '020401' },
      { path: '/save-base-data', method: 'post', action: 'SaveBaseData', purview: '020402' },
      { path: '/delete-data', action: 'DeleteData', purview: '020403' },
      { path: '/output-data', method: 'post', action: 'OutputData', purview: '020404' },
    ];
  }
  async FetchList(req, res) {
    const queryData = await BiProjectWorksheets.findAll({
      where: {
        project_id: req.query.project_id,
      }
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
  async FetchResultData(req, res) {
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
    const data = await this.worksheetService.getDashboardData({
      database,
      source: projectSource,
      worksheet: {values, columns, rows, orders, filters}
    });

    return res.json({
      code: 200,
      data: data
    });
  }
  async FetchData(req, res, next) {
    try {
      const queryData = await BiProjectWorksheets.find({
        where: {
          id: req.query.id
        }
      });

      res.json({
        code: 200,
        data: queryData
      });
    } catch (e) {
      return next(e);
    }
  }
  async SaveData(req, res, next) {
    const {
      sources,
      values,
      columns,
      rows,
      orders,
      filters,
      id,
      project_id,
      worksheet_name,
      source_id,
      purview_img,
      worksheetResultType
    } = req.body;
    let purviewImgPath;

    try {
      if (purview_img) {
        try {
          purviewImgPath = await ImageUtil.saveBase64(purview_img, `/storage/worksheet/purview/${uuid.v4()}.png`);
        } catch (error) {
          console.log(error);
        }
      }

      if (id) {
        const worksheetData = await BiProjectWorksheets.find({
          where: {
            id,
            project_id
          }
        });

        if (!worksheetData) {
          return res.json({
            code: 404,
            message: 'not found worksheet'
          });
        }
        FileUtil.delFile(worksheetData.worksheet_purview);
        worksheetData.worksheet_purview = purviewImgPath || '';
        worksheetData.worksheet_data = JSON.stringify({
          sources, values, columns, rows, orders, filters, worksheetResultType
        });
        await worksheetData.save();

        return res.json({
          code: 200,
          data: {
            id: worksheetData.id,
            worksheet_name: worksheetData.worksheet_name
          }
        });
      } else {
        const result = await BiProjectWorksheets.create({
          project_id,
          source_id,
          worksheet_name,
          worksheet_purview: purviewImgPath,
          worksheet_data: JSON.stringify({
            sources, values, columns, rows, orders, filters, worksheetResultType
          })
        });

        return res.json({
          code: 200,
          data: {
            id: result.id,
            worksheet_name: result.worksheet_name
          }
        });
      }

    } catch (e) {
      return next(e);
    }
  }
  async SaveBaseData(req, res, next) {
    const {id, worksheet_name} = req.body;

    if (_.isEmpty(worksheet_name) && !id) {
      return res.json({
        code: 400
      });
    }

    try {
      const worksheetData = await BiProjectWorksheets.find({
        where: {
          id
        }
      });

      if (!worksheetData) {
        return res.json({
          code: 404,
          message: 'not found worksheet'
        });
      }
      worksheetData.worksheet_name = worksheet_name;
      await worksheetData.save();

      return res.json({
        code: 200
      });
    } catch (e) {
      return next(e);
    }
  }
  async DeleteData(req, res) {
    const id = req.query.id;

    if (!id) {
      return res.json({
        code: 400
      });
    }
    const worksheetData = await BiProjectWorksheets.findById(id);

    if (!worksheetData) {
      return res.json({
        code: 404
      });
    }
    await this.worksheetService.deleteWorksheet(id);

    return res.json({
      code: 200
    });
  }
  async OutputData(req, res) {
    let {values, columns, rows, orders, filters, id, source_id} = req.body;

    if (_.isEmpty(rows) && _.isEmpty(values)) {
      return res.json({
        code: 400
      });
    }
    res.setTimeout(1000 * 60 * 5);
    try {
      let projectSource, database, worksheet_name;

      if (id) {
        const worksheetData = await this.worksheetService.getFullWorksheetData(id);

        if (!worksheetData || !worksheetData.ProjectSource || !worksheetData.ProjectSource.Database) {
          return res.json({
            code: 400,
            message: 'not found worksheet'
          });
        }
        worksheet_name = worksheetData.worksheet_name;
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
        worksheet_name = '未命名工作簿';
        projectSource = projectSourceData;
        database = projectSourceData.Database;
      }
      const data = await this.worksheetService.getDashboardData({
        database,
        source: projectSource,
        worksheet: {values, columns, rows, orders, filters}
      });

      const buffer = ExcelUtil.exportExcel(rows, columns, values, data, worksheet_name);

      res.setHeader('Content-Type', 'application/msexcel');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(worksheet_name)}.xlsx`);
      return res.end(buffer, 'binary');
    } catch (e) {
      console.error(e);
      return res.json({
        code: 400,
        message: e
      });
    }
  }
}

module.exports = WorksheetController;
