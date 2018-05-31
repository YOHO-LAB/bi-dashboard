const Service = require('../framework/service');
const _ = require('lodash');
const YoHoException = require('../framework/exception');
const {DbUtil} = require('../utils');
const {BiDatabaseFilter, BiUserDatabaseFilter, BiDatabases, BiDatabaseSchemes, BiRoles} = require('../db');

class DatabaseFilterService extends Service {
  constructor() {
    super(BiDatabaseFilter);
  }
  async getAllDatabaseFilter() {
    return await BiDatabaseFilter.findAll({
      include: [{
        model: BiDatabases,
        as: 'Database',
        required: true
      }, {
        model: BiDatabaseSchemes,
        as: 'Scheme',
        required: true
      }]
    });
  }
  async getDatbaseFiltersByIds(ids) {
    return await BiDatabaseFilter.findAll({
      where: {
        id: ids
      }
    });
  }
  async getUserDatabaseFilter(database) {
    const dataFilters = await BiDatabaseFilter.findAll({
      include: [{
        model: BiDatabaseSchemes,
        as: 'Scheme',
        required: true
      }, {
        model: BiRoles,
        as: 'Roles',
        where: {
          id: this.$user.roleId
        }
      }],
      where: {
        table_name: 'dim_shops',
        database_id: database.id
      }
    });

    if (!dataFilters.length) {
      return void 0;
    }
    const result = await DbUtil.connectSequelize(database, sequelize => {
      return sequelize.query(`SELECT shop_id FROM public.shop_keeper where email = '${this.$user.userInfo.email}'`, { type: sequelize.QueryTypes.SELECT});
    });

    return _.map(dataFilters, df => {
      return {
        database_id: database.id,
        scheme_name: df.Scheme.scheme_name,
        table_name: df.table_name,
        field_name: df.field_name,
        filter_param_type: df.filter_param_type,
        filter_condition: df.filter_condition,
        filter_value: _.map(result, r => r.shop_id)
      };
    });
  }
  async deleteDatabaseFilter(id) {
    return Promise.all([
      BiDatabaseFilter.destroy({
        where: {id}
      }),
      BiUserDatabaseFilter.destroy({
        where: {database_filter_id: id}
      })
    ]);
  }
  async saveDatabaseFilter(databaseFilter) {
    if (databaseFilter.id) {
      const model = await BiDatabaseFilter.findById(databaseFilter.id);

      if (!model) {
        throw new YoHoException('找不到过滤数据');
      }
      Object.assign(model, databaseFilter);
      return await model.save();
    } else {
      return await BiDatabaseFilter.create(databaseFilter);
    }
  }
}

module.exports = DatabaseFilterService;
