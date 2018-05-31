const _ = require('lodash');
const YoHoException = require('../framework/exception');
const Service = require('../framework/service');
const {DbUtil} = require('../utils');
const {BiDatabases, BiDatabaseSchemes, BiDatabaseSchemeRoles} = require('../db');

class DatabaseService extends Service {
  constructor() {
    super(BiDatabases);
  }
  async getDatabaseExtends(id) {
    return await BiDatabases.find({
      include: [{
        model: BiDatabaseSchemes,
        as: 'Schemes',
        include: [{
          model: BiDatabaseSchemeRoles,
          as: 'Roles'
        }]
      }],
      where: {
        id
      }
    });
  }
  async getDatabasesByRole(rid) {
    return await BiDatabases.findAll({
      include: [{
        model: BiDatabaseSchemes,
        as: 'Schemes',
        required: true,
        include: [{
          model: BiDatabaseSchemeRoles,
          as: 'Roles',
          required: true,
          where: {
            role_id: rid
          }
        }]
      }]
    });
  }
  async getSchemesByDb(rid, databaseId) {
    return await BiDatabaseSchemes.findAll({
      include: [{
        model: BiDatabases,
        as: 'Database',
        required: true,
        where: {
          id: databaseId
        }
      }, {
        model: BiDatabaseSchemeRoles,
        as: 'Roles',
        required: true,
        where: {
          role_id: rid
        }
      }]
    });
  }
  async getTablesByScheme(rid, schemeId) {
    const scheme = await BiDatabaseSchemes.find({
      include: [{
        model: BiDatabaseSchemeRoles,
        as: 'Roles',
        required: true,
        where: {
          role_id: rid
        }
      }, {
        model: BiDatabases,
        as: 'Database',
        required: true
      }],
      where: {
        id: schemeId
      }
    });

    if (scheme) {
      const result = await DbUtil.getTablesByScheme(scheme.Database, scheme.scheme_name);

      return result;
    }
  }
  async getColumnsByTable(rid, schemeId, tableName) {
    const scheme = await BiDatabaseSchemes.find({
      include: [{
        model: BiDatabaseSchemeRoles,
        as: 'Roles',
        required: true,
        where: {
          role_id: rid
        }
      }, {
        model: BiDatabases,
        as: 'Database',
        required: true
      }],
      where: {
        id: schemeId
      }
    });

    if (scheme) {
      const columns = await DbUtil.getColumnsByTable(scheme.Database, scheme.scheme_name, tableName);

      return {
        columns,
        scheme,
      };
    }
  }
  deleteDatabase(databaseId) {
    const mainWhere = {
      where: {
        id: databaseId
      }
    };
    const belongWhere = {
      where: {
        database_id: databaseId
      }
    };

    return Promise.all([
      BiDatabases.destroy(mainWhere),
      BiDatabaseSchemes.destroy(belongWhere),
      BiDatabaseSchemeRoles.destroy(belongWhere),
    ]);
  }
  async saveData({name, db_host, db_port, db_user, db_password, db_version, db_name, schemes, id}) {
    let result;
    const database = {
      name,
      db_host,
      db_port,
      db_user,
      db_version,
      db_name,
      create_role: this.$user.roleId,
      create_user: this.$user.userId,
    };

    if (id) {
      const databaseData = await BiDatabases.find({
        where: {
          id
        }
      });

      if (!databaseData) {
        throw new YoHoException('找不到数据库');
      }
      Object.assign(databaseData, database);
      if (db_password) {
        databaseData.db_password = db_password;
      }
      result = await databaseData.save();
    } else {
      database.db_password = db_password;
      result = await BiDatabases.create(database);
    }

    await Promise.all([
      BiDatabaseSchemes.destroy({
        where: {database_id: result.id}
      }),
      BiDatabaseSchemeRoles.destroy({
        where: {database_id: result.id}
      })
    ]);

    const promiseSchemes = _.map(_.filter(schemes, s => s.roles.length), s => {
      return BiDatabaseSchemes.create({
        scheme_name: s.scheme,
        database_id: result.id,
        create_user: this.$user.userId
      }).then(scheme => {
        const schemeRoleDatas = [];

        _.each(s.roles, r => {
          schemeRoleDatas.push({
            database_id: result.id,
            database_scheme_id: scheme.id,
            role_id: r
          });
        });
        return BiDatabaseSchemeRoles.bulkCreate(schemeRoleDatas);
      });
    });

    await promiseSchemes;

    return result;

  }
}

module.exports = DatabaseService;
