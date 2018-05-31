const Controller = require('../framework/controller');
const {DbUtil} = require('../utils');
const _ = require('lodash');

class DatabaseController extends Controller {
  constructor(databaseService, databaseFilterService) {
    super();
    this.databaseService = databaseService;
    this.databaseFilterService = databaseFilterService;
  }
  static route() {
    return [
      { path: '/fetch-list', action: 'FetchList', purview: '0104' },
      { path: '/fetch-data', action: 'FetchData', purview: '0104' },
      { path: '/fetch-databases-role', action: 'FetchDatabases', purview: '0104' },
      { path: '/fetch-database-schemes', action: 'FetchSchemes', purview: '0104' },
      { path: '/fetch-scheme-tables', action: 'FetchTables', purview: '0104' },
      { path: '/fetch-table-columns', action: 'FetchColumns', purview: '0104' },
      { path: '/test', method: 'post', action: 'SourceTest', purview: '0104' },
      { path: '/save-data', method: 'post', action: 'SaveData', purview: '0101' },
      { path: '/delete-data', action: 'DeleteData', purview: '0103' },
      { path: '/fetch-database-filter', action: 'FetchDatabaseFilter', purview: '0101' },
      { path: '/delete-database-filter', method: 'post', action: 'DeleteDatabaseFilter', purview: '0103' },
      { path: '/save-database-filter', method: 'post', action: 'SaveDatabaseFilter', purview: '0101' },
    ];
  }
  async FetchList(req, res) {
    const queryData = await this.databaseService.gets();

    res.json({
      code: 200,
      data: _.map(queryData, d => {
        return {
          name: d.name,
          db_host: d.db_host,
          db_name: d.db_name,
          db_port: d.db_port,
          db_user: d.db_user,
          db_version: d.db_version,
          id: d.id,
        };
      })
    });
  }
  async FetchData(req, res) {
    const {id} = req.query;

    if (!id) {
      return res.json({
        code: 200,
        message: '参数错误'
      });
    }
    const database = await this.databaseService.getDatabaseExtends(id);

    return res.json({
      code: 200,
      data: {
        name: database.name,
        dbHost: database.db_host,
        dbName: database.db_name,
        dbPort: database.db_port,
        dbUser: database.db_user,
        dbVersion: database.db_version,
        id: database.id,
        schemes: _.map(database.Schemes, s => {
          return {
            schemeName: s.scheme_name,
            schemeId: s.id,
            roles: _.map(s.Roles, r => r.role_id)
          };
        })
      }
    });
  }
  async SaveData(req, res) {
    let {name, db_host, db_port, db_user, db_password, db_version, db_name, schemes, id} = req.body;

    if (!name || !db_host || !db_port || !db_user || !db_name || !schemes.length) {
      return res.json({
        code: 400
      });
    }
    if (!id && !db_password) {
      return res.json({
        code: 400
      });
    }
    const data = {
      name,
      db_host,
      db_port,
      db_user,
      db_password,
      db_version,
      db_name,
      schemes,
      id
    };
    const result = await this.databaseService.saveData(data);

    return res.json({
      code: 200,
      data: result
    });
  }
  async DeleteData(req, res) {
    const id = req.query.id;

    if (!id) {
      return res.json({
        code: 400
      });
    }
    const databaseData = await this.databaseService.get(id);

    if (!databaseData) {
      return res.json({
        code: 404
      });
    }
    await this.databaseService.deleteDatabase(id);

    return res.json({
      code: 200
    });
  }
  async SourceTest(req, res) {
    let {id, db_host, db_port, db_user, db_password, db_version, db_name} = req.body;

    if (!db_host || !db_port || !db_user || !db_name) {
      return res.json({
        code: 400
      });
    }
    if (!db_password) {
      if (id) {
        const databaseData = await this.databaseService.get(id);

        if (databaseData) {
          db_password = databaseData.db_password;
        }
      } else {
        return res.json({
          code: 400
        });
      }
    }

    try {
      const schemes = await DbUtil.getAllSchemes({db_name, db_user, db_password, db_port, db_host, db_version});

      return res.json({
        code: 200,
        data: _.map(schemes, scheme => scheme.name)
      });
    } catch (e) {
      return res.json({
        code: 400,
        message: e
      });
    }
  }
  async FetchDatabases(req, res) {
    const queryModel = await this.databaseService.getDatabasesByRole(this.$user.roleId);

    return res.json({
      code: 200,
      data: _.map(queryModel, q => {
        return {
          id: q.id,
          host: q.db_host,
          name: q.db_name
        };
      })
    });
  }
  async FetchSchemes(req, res) {
    const {databaseId} = req.query;

    if (!databaseId) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    const queryModel = await this.databaseService.getSchemesByDb(this.$user.roleId, databaseId);

    return res.json({
      code: 200,
      data: _.map(queryModel, q => {
        return {
          id: q.id,
          name: q.scheme_name,
          dbName: q.Database.db_name
        };
      })
    });
  }
  async FetchTables(req, res) {
    const {schemeId} = req.query;

    if (!schemeId) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    const queryModel = await this.databaseService.getTablesByScheme(this.$user.roleId, schemeId);

    if (!queryModel) {
      return res.json({
        code: 400,
        message: '找不到对应的scheme，或者没有权限'
      });
    }

    return res.json({
      code: 200,
      data: _.map(queryModel, q => {
        return {
          tableName: q.name
        };
      })
    });
  }
  async FetchColumns(req, res) {
    const {schemeId, tableName} = req.query;

    if (!schemeId || !tableName) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    const {scheme, columns} = await this.databaseService.getColumnsByTable(this.$user.roleId, schemeId, tableName);

    if (!scheme) {
      return res.json({
        code: 400,
        message: '找不到对应的table，或者没有权限'
      });
    }
    return res.json({
      code: 200,
      data: {
        tableName,
        schemeId,
        schemeName: scheme.scheme_name,
        columns: _.map(columns, c => {
          return {
            title: c.column_name,
            comment: c.comment,
            type: DbUtil.convertType(c.data_type),
            fieldType: c.data_type
          };
        })
      }
    });
  }
  async FetchDatabaseFilter(req, res) {
    const result = await this.databaseFilterService.getAllDatabaseFilter();

    return res.json({
      code: 200,
      data: _.map(result, r => {
        return {
          id: r.id,
          filterName: r.filter_name,
          databaseName: r.Database.name,
          databaseId: r.database_id,
          databaseSchemeId: r.database_scheme_id,
          schemeName: r.Scheme.scheme_name,
          tableName: r.table_name,
          fieldName: r.field_name,
          filterParamType: r.filter_param_type,
          filterCondition: r.filter_condition,
        };
      })
    });
  }
  async DeleteDatabaseFilter(req, res) {
    const {id} = req.body;

    if (!id) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    await this.databaseFilterService.deleteDatabaseFilter(id);

    return res.json({
      code: 200,
      message: '删除成功'
    });
  }
  async SaveDatabaseFilter(req, res) {
    const {id, filterName, databaseId, databaseSchemeId, tableName, fieldName, filterParamType, filterCondition} = req.body;

    if (!filterName || !databaseId || !databaseSchemeId || !tableName || !fieldName || !filterParamType || !filterCondition) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    const databaseFilter = {
      id,
      filter_name: filterName,
      database_id: databaseId,
      database_scheme_id: databaseSchemeId,
      table_name: tableName,
      field_name: fieldName,
      filter_param_type: filterParamType,
      filter_condition: filterCondition
    };

    await this.databaseFilterService.saveDatabaseFilter(databaseFilter);

    return res.json({
      code: 200,
      message: '保存成功'
    });
  }
}


module.exports = DatabaseController;
