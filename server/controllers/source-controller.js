const Controller = require('../framework/controller');
const {BiProjectSources, BiProjectSourceFields} = require('../db');
const _ = require('lodash');

class SourceController extends Controller {
  constructor(sourceService) {
    super();
    this.sourceService = sourceService;
  }
  static route() {
    return [
      { path: '/fetch-list', action: 'FetchList', purview: '020604' },
      { path: '/fetch-data', action: 'FetchData', purview: '020604' },
      { path: '/save-data', method: 'post', action: 'SaveData', purview: '020601' },
      { path: '/fetch-purview-data', method: 'post', action: 'FetchPurviewData', purview: '020601' },
      { path: '/save-base-data', method: 'post', action: 'SaveBaseData', purview: '020602' },
      { path: '/delete-data', method: 'post', action: 'DeleteData', purview: '020603' },
      { path: '/fetch-field-list', action: 'FetchFieldList', purview: '020601' },
    ];
  }
  async FetchList(req, res) {
    const queryData = await BiProjectSources.findAll({
      attributes: ['id', 'database_id', 'project_id', 'source_name', 'created_at', 'create_user'],
      where: {
        project_id: req.query.project_id
      }
    });

    res.json({
      code: 200,
      data: queryData
    });
  }
  async FetchData(req, res) {
    const queryData = await BiProjectSources.find({
      where: {
        id: req.query.id
      }
    });

    let sourceTable;

    try {
      sourceTable = JSON.parse(queryData.source_table);
    } catch (error) {
      sourceTable = {};
    }

    res.json({
      code: 200,
      data: {
        id: queryData.id,
        projectId: queryData.project_id,
        databaseId: queryData.database_id,
        sourceName: queryData.source_name,
        sourceTable,
        sourceDistinct: queryData.source_distinct,
        sourceSql: queryData.source_sql,
        sourceType: queryData.source_type,
      }
    });
  }
  async SaveData(req, res) {
    const {id, source_name, database_id, project_id, tables, relations, columns, sql, source_type, distinct} = req.body;

    if (sql) {
      const check = this.sourceService.checkSql(sql);

      if (!check) {
        return res.json({
          code: 400,
          message: 'sql验证失败'
        });
      }
    }

    const model = await this.sourceService.saveSourceData({
      id,
      source_name,
      database_id,
      project_id,
      tables,
      relations,
      columns,
      source_type,
      sql,
      distinct
    }, this.$user.userId);

    if (!model) {
      return res.json({
        code: 500,
        message: '保存失败'
      });
    }
    return res.json({
      code: 200,
      data: {
        id: model.id
      }
    });
  }
  async FetchPurviewData(req, res) {
    let {database_id, tables, relations, sql, source_type, distinct} = req.body;

    if (!database_id ||
            (source_type === 'SQL' && !sql) ||
            (source_type === 'VIEW' && (!tables || !relations))) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }

    if (sql) {
      const check = this.sourceService.checkSql(sql);

      if (!check) {
        return res.json({
          code: 400,
          message: 'sql验证失败'
        });
      }
    }

    const purviewData = await this.sourceService.getPurviewData({database_id, tables, relations, sql, source_type, distinct});

    return res.json({
      code: 200,
      data: purviewData
    });
  }
  async SaveBaseData(req, res) {
    const {id, source_name} = req.body;

    if (_.isEmpty(source_name) && !id) {
      return res.json({
        code: 400
      });
    }

    const sourceData = await BiProjectSources.find({
      where: {
        id
      }
    });

    if (!sourceData) {
      return res.json({
        code: 404,
        message: 'not found worksheet'
      });
    }
    sourceData.source_name = source_name;
    await sourceData.save();

    return res.json({
      code: 200
    });
  }
  async DeleteData(req, res) {
    let id = parseInt(`0${req.body.id}`, 10);

    let sources = await BiProjectSources.findById(id);

    if (!sources) {
      return res.json({
        code: 404,
        message: 'not found source'
      });
    }
    await this.sourceService.deleteSource(id);

    return res.json({
      code: 200
    });
  }
  async FetchFieldList(req, res) {
    const queryData = await BiProjectSourceFields.findAll({
      where: {
        source_id: req.query.source_id,
        is_del: false
      }
    });

    res.json({
      code: 200,
      data: _.map(queryData, q => {
        return {
          id: q.id,
          sourceId: q.source_id,
          tableId: q.table_id,
          tableName: q.table_name,
          tableSchemeName: q.table_scheme_name,
          tableAliasName: q.table_alias_name,
          fieldName: `${q.table_alias_name ? `${q.table_alias_name}_` : ''}${q.field_name}`,
          fieldType: q.field_type,
          fieldOriType: q.field_ori_type,
          fieldAlias: q.field_alias || q.field_name,
        };
      })
    });
  }
}

module.exports = SourceController;
