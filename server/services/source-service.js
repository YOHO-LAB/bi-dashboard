const _ = require('lodash');
const Service = require('../framework/service');
const {DbUtil} = require('../utils');
const YohoException = require('../framework/exception');
const {
  BiProjectSources,
  BiProjectSourceTables,
  BiProjectSourceTableRelations,
  BiProjectSourceFields,
  BiDatabases,
  BiProjectSourceTableRelationConditions,
  sequelize
} = require('../db');

const REG_COLUMN_KEY = /^([A-Z]+)_(.*)$/;
const REG_CHECK_SQL = /\b(update|truncate|delete|insert|drop|exec|declare)\b/;

class SourceService extends Service {
  constructor(databaseService) {
    super(BiProjectSources);
    this.databaseService = databaseService;
  }
  getTableColumnsStructure(tables) {
    const columns = {};

    _.each(tables, t => {
      columns[t.alias] = {};
      _.each(t.columns, c => {
        columns[t.alias][c.title] = Object.assign({
          tableAlias: t.alias,
          tableName: t.tableName,
          schemeName: t.schemeName
        }, c);
      });
    });
    return columns;
  }
  checkSql(sql) {
    return !REG_CHECK_SQL.test(sql);
  }
  async getPurviewData({database_id, tables, relations, sql, source_type, distinct}) {
    const database = await this.databaseService.get(database_id);

    if (!database) {
      throw new YohoException('数据连接不存在');
    }
    let joinSql;

    if (source_type === 'SQL') {
      joinSql = `${sql} LIMIT 10`;
    } else if (source_type === 'VIEW') {
      const mainTable = _.find(tables, t => _.every(relations, r => r.to !== t.id));

      if (!mainTable) {
        throw new YohoException('找不到主表');
      }
      joinSql = DbUtil.joinRelationTable({tables, relations, limit: 10, distinct});
    }

    const result = await DbUtil.connectSequelize(database, (seq) => {
      return seq.query(joinSql, { type: seq.QueryTypes.SELECT});
    });
    let columns = {};

    if (source_type === 'SQL') {
      const fsRow = result.length > 0 ? result[0] : {};

      columns[''] = {};
      _.each(Object.keys(fsRow), r => {
        let type = typeof fsRow[r] === 'number' ? 'M' : 'D';

        columns[''][r] = {
          tableAlias: '',
          tableName: '',
          schemeName: '',
          title: r,
          type,
        };
      });
    } else {
      columns = this.getTableColumnsStructure(tables);
    }
    const cacheColumns = {};
    const data = _.map(result, r => {
      const row = {};

      if (source_type === 'SQL') {
        row[''] = r;
      } else {
        _.each(r, (v, k) => {
          let tableAlias, title;

          if (!cacheColumns[k]) {
            [, tableAlias, title] = k.match(REG_COLUMN_KEY);
            cacheColumns[k] = [tableAlias, title];
          } else {
            [tableAlias, title] = cacheColumns[k];
          }

          if (!row[tableAlias]) {
            row[tableAlias] = {};
          }

          row[tableAlias][title] = v;
        });
      }


      return row;
    });

    return {data, columns};
  }
  async saveSourceData({id, source_name, database_id, project_id, tables, relations, columns, sql, source_type, distinct}, userId) {
    const sourceModel = {
      source_name,
      project_id,
      database_id,
      source_type,
      source_sql: sql,
      source_distinct: distinct,
      source_table: JSON.stringify({
        tables: source_type === 'VIEW' ? tables : [],
        relations: source_type === 'VIEW' ? relations : [],
        columns,
        sql
      }),
      create_user: userId,
    };
    let model;

    return sequelize.transaction(async() => {
      if (id) {
        model = await this.get(id);

        Object.assign(model, sourceModel);
        await this.save(model);

        await BiProjectSourceTables.destroy({
          where: {
            source_id: model.id
          }
        });
        await BiProjectSourceTableRelations.destroy({
          where: {
            source_id: model.id
          }
        });
        await BiProjectSourceFields.destroy({
          where: {
            source_id: model.id
          }
        });
      } else {
        model = await this.create(sourceModel);
      }

      let tableModels = [];

      if (source_type === 'VIEW') {
        tableModels = await Promise.all(_.map(tables, t => {
          return BiProjectSourceTables.create({
            source_id: model.id,
            scheme_name: t.schemeName,
            table_name: t.tableName,
            alias_name: t.alias
          });
        }));
        await Promise.all(_.map(relations, r => {
          const mTable = _.find(tables, t => t.id === r.from);
          const bTable = _.find(tables, t => t.id === r.to);

          if (!mTable || !bTable) {
            return;
          }
          let mainTable = _.find(tableModels, m => mTable.alias === m.alias_name &&
                            mTable.schemeName === m.scheme_name);
          let belongTable = _.find(tableModels, m => bTable.alias === m.alias_name &&
                            bTable.schemeName === m.scheme_name);

          if (!mainTable || !belongTable) {
            return;
          }
          return BiProjectSourceTableRelations.create({
            source_id: model.id,
            main_table_id: mainTable.id,
            belong_table_id: belongTable.id,
            join_type: r.join,
            Conditions: _.map(r.conditions, cond => {
              return {
                main_field: cond.mainField,
                belong_field: cond.belongField,
                relation_condition: cond.relationCondition
              };
            })
          }, {
            include: [{
              model: BiProjectSourceTableRelationConditions,
              as: 'Conditions'
            }]
          });
        }).filter(r => r));
      }

      await BiProjectSourceFields.bulkCreate(_.map(columns, c => {

        let table = _.find(tableModels, m => c.tableAlias === m.alias_name &&
                    c.schemeName === m.scheme_name);

        return {
          source_id: model.id,
          table_id: table ? table.id : 0,
          table_scheme_name: table ? table.scheme_name : '',
          table_name: table ? table.table_name : '',
          table_alias_name: table ? table.alias_name : '',
          field_name: c.title,
          field_alias: c.alias,
          field_type: c.type,
          field_ori_type: c.fieldType,
          is_del: c.hide,
        };
      }));
      return model;
    }).then(result => {
      return result;
    });
  }
  deleteSource(sourceId) {
    const mainWhere = {
      where: {
        id: sourceId
      }
    };
    const belongWhere = {
      where: {
        source_id: sourceId
      }
    };

    return Promise.all([
      BiProjectSources.destroy(mainWhere),
      BiProjectSourceFields.destroy(belongWhere),
      BiProjectSourceTables.destroy(belongWhere),
      BiProjectSourceTableRelations.destroy(belongWhere)
    ]);
  }
  async getFullSourceData(sourceId) {
    return await BiProjectSources.find({
      attributes: ['id', 'source_type', 'source_sql'],
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
      }],
      where: {
        id: sourceId
      }
    });
  }
}

module.exports = SourceService;

