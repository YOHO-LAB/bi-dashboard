const Sequelize = require('sequelize');
const _ = require('lodash');

const connectSequelize = ({db_name, db_user, db_password, db_port, db_host, db_version}, callQuery) => {
  return new Promise(async(resolve, reject) => {
    try {
      const sequelize = new Sequelize(db_name, db_user, db_password, {
        port: db_port,
        host: db_host,
        databaseVersion: db_version,
        dialect: 'postgres',
      });

      await sequelize.authenticate();
      const result = await callQuery(sequelize);

      await sequelize.close();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

const getAllSchemes = async(database) => {
  return await connectSequelize(database, (sequelize) => {
    return sequelize.query('select nspname as name from pg_catalog.pg_namespace where nspname !~ \'^pg_\' AND nspname !~ \'^gp_\' AND nspname <> \'information_schema\';', { type: sequelize.QueryTypes.SELECT});
  });
};
const getTablesByScheme = async(database, scheme) => {
  return await connectSequelize(database, (sequelize) => {
    return sequelize.query('SELECT table_name as name FROM information_schema.tables WHERE table_schema = :table_schema AND table_type LIKE \'%TABLE\' AND table_name != \'spatial_ref_sys\';',
      {
        replacements: {
          table_schema: scheme
        },
        type: sequelize.QueryTypes.SELECT
      });
  });
};
const getColumnsByTable = async(database, scheme, table) => {
  return await connectSequelize(database, (sequelize) => {
    return sequelize.query(`
select
    col_description(pga.attrelid,pga.attnum) as comment,
    format_type(pga.atttypid,pga.atttypmod) as data_type,
    pga.attname as column_name
from 
    pg_class as pgc
inner join pg_attribute as pga on pgc.oid = pga.attrelid
inner join pg_namespace as pgn on pgc.relnamespace = pgn.oid
where 
    pgc.relname = :table_name
and
    pgn.nspname = :table_schema
and
    pga.attnum > 0
and 
    pga.atttypid > 0`,
    {
      replacements: {
        table_name: table,
        table_schema: scheme
      },
      type: sequelize.QueryTypes.SELECT
    });
  });
};
const convertType = (type) => {
  if (/text|character|timestamp/.test(type)) {
    return 'D';
  } else {
    return 'M';
  }
};
const convertCondition = (op) => {
  return ({
    '=': '=',
    '>': '>',
    '<': '<'
  })[op];
};
const joinRelationCondition = (relation, toTable, fromTable) => {
  return _.join(_.map(relation.conditions, cond => {
    return `"${toTable.alias}"."${cond.belongField}" ${convertCondition(cond.relationCondition)} "${fromTable.alias}"."${cond.mainField}"`;
  }), ' AND ');
};
const joinTableJoin = (table, tables, relations) => {
  const toRelations = _.filter(relations, r => r.from === table.id);
  let joins = [];

  _.each(toRelations, r => {
    const toTable = _.find(tables, t => t.id === r.to);
    const toJoins = joinTableJoin(toTable, tables, relations);
    const condition = joinRelationCondition(r, toTable, table);
    const join = r.join || 'INNER';
    const sql = `${join} JOIN "${toTable.schemeName}"."${toTable.tableName}" AS "${toTable.alias}" ON ${condition}`;

    joins.push(sql);

    if (toJoins.length) {
      joins = joins.concat(toJoins);
    }
  });

  return joins;
};

const joinTableColumns = (tables) => {
  let columns = [];

  _.each(tables, t => {
    columns = columns.concat(_.map(t.columns, c => `"${t.alias}"."${c.title}" AS "${t.alias}_${c.title}"`));
  });
  return columns;
};
const joinTableFilter = (tables, filter) => {
  const where = [];

  if (!filter) {
    return '';
  }

  _.each(filter, f => {
    const filterTable = _.find(tables, t => t.schemeName === f.scheme_name &&
                t.tableName === f.table_name);

    if (filterTable) {
      const filterTableColumn = _.find(filterTable.columns, c => c.title === f.field_name);

      if (filterTableColumn) {
        let filterValue;

        if (f.filter_param_type === 'array') {
          filterValue = _.join(f.filter_value, ',');
        } else if (f.filter_param_type === 'number') {
          filterValue = f.filter_value;
        } else if (f.filter_param_type === 'string') {
          filterValue = `"${f.filter_value}"`;
        }
        if (filterValue) {
          where.push(f.filter_condition.replace('$column', `"${filterTable.alias}"."${filterTableColumn.title}"`).replace('$value', filterValue));
        } else {
          where.push('1 = 2');
        }
      }
    }
  });
  return _.join(where, ' AND ');
};
const joinRelationTable = ({tables, relations, limit = 0, filter, distinct = false}) => {
  const mainTable = _.find(tables, t => _.every(relations, r => r.to !== t.id));
  const tableJoins = joinTableJoin(mainTable, tables, relations);
  const columnJoins = _.join(joinTableColumns(tables), ',');
  const filterJoins = joinTableFilter(tables, filter);

  return ` SELECT${distinct ? ' DISTINCT' : ''} ${columnJoins} FROM  "${mainTable.schemeName}"."${mainTable.tableName}" AS "${mainTable.alias}" ${_.join(tableJoins, ' ')}${filterJoins ? ` WHERE ${filterJoins}` : ''}${limit ? ` LIMIT ${limit}` : ''}`;
};

module.exports = {
  convertType,
  getAllSchemes,
  getTablesByScheme,
  getColumnsByTable,
  connectSequelize,
  joinRelationTable,
};
