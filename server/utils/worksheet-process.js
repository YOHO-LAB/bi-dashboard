const _ = require('lodash');
const YoHoException = require('../framework/exception');
const { joinRelationTable } = require('./db');
const Sequelize = require('sequelize');
const Timer = require('./timer');
const dayjs = require('dayjs');
const logger = global.yoho.logger;

const CALC_TYPE = [{
  title: 'SUM'
}, {
  title: 'AVG'
}, {
  title: 'COUNT'
}, {
  title: 'MIN'
}, {
  title: 'MAX'
}, {
  title: 'CONCAT'
}];

class WorksheetProcess {
  constructor({ database, source, dbfilter }) {
    this.sequelize = new Sequelize(database.db_name, database.db_user, database.db_password, {
      host: database.db_host,
      port: database.db_port,
      databaseVersion: database.db_version,
      dialect: 'postgres',
      dialectOptions: {
        statement_timeout: 1000 * 60 * 2
      },
      logging: (log) => {
        logger.info(log);
      }
    });
    this.database = database;
    this.dbfilter = dbfilter;
    this.source = source;
    this.calcIndex = 0;
    this.calcGroupFields = {};
  }
  async execute(options) {
    const timer = new Timer();

    let { values, columns, rows, orders, filters } = this._clone(options);

    rows = this._processCategory(rows);
    columns = this._processCategory(columns);

    timer.put('sql query');
    const sources = await this.query({ values, columns, rows, orders, filters });

    logger.info('sql query %d', timer.put('sql query'));

    timer.put('converData');
    const result = this._processData({ sources, columns, rows, orders, values, filters });

    logger.info('converData %d', timer.put('converData'));

    return result;
  }
  async query({ values, columns, rows, orders, filters }) {
    let attributes = [];
    let group = [];
    const order = [];
    const where = {};

    _.each(_.filter(rows, r => r.type === 'D'), r => {
      const col = this._castDimension(r);

      attributes = this._appendArray(attributes, typeof col === 'string' ? col : [col, r.title]);
      group = this._appendArray(group, col);
      if (_.isEmpty(orders)) {
        order.push([col, 'ASC']);
      }
    });

    values = _.concat(values, _.filter(rows, r => r.type === 'M'));
    _.each(columns, c => {
      const col = this._castDimension(c);

      attributes = this._appendArray(attributes, typeof col === 'string' ? col : [col, c.title]);
      group = this._appendArray(group, col);
    });
    _.each(values, v => {
      const col = this._castMeasure(v);

      attributes = this._appendArray(attributes, col);
    });

    _.each(filters, f => {
      if (f.type === 'D') {
        const col = this._castDimension(f);

        attributes = this._appendArray(attributes, typeof col === 'string' ? col : [col, f.title]);
        group = this._appendArray(group, col);
      } else if (f.type === 'M') {
        const col = this._castMeasure(f);

        attributes = this._appendArray(attributes, col);
        if (!_.some(values, v => v.title === f.title)) {
          values.push(f);
        }
      }
    });

    const condition = {
      attributes,
      order,
      where
    };

    if (group.length) {
      condition.group = group;
    }
    const sqlGen = this.sequelize.dialect.QueryGenerator;

    let sql = sqlGen.selectQuery('#######', Object.assign(_.clone(condition), {
      tableAs: 'TABLE1'
    }));

    sql = sql.replace('"#######"', this._getFromTable(this.source));

    try {
      const data = await this.sequelize.query(sql, { type: this.sequelize.QueryTypes.SELECT });

      return data;
    } catch (err) {
      throw new YoHoException(err);
    }
  }
  close() {
    try {
      this.sequelize.close();
    } catch (e) {
      console.error(e);
    }
  }
  _getFromTable({ Tables, Relations, Columns, source_type, source_sql }) {
    let sql;

    if (source_type === 'VIEW') {
      const tables = _.map(Tables, t => {
        return {
          id: t.id,
          schemeName: t.scheme_name,
          tableName: t.table_name,
          alias: t.alias_name,
          columns: _.map(_.filter(Columns, c => c.table_id === t.id), c => {
            return {
              title: c.field_name,
              alias: c.field_alias
            };
          })
        };
      });
      const relations = _.map(Relations, r => {
        return {
          from: r.main_table_id,
          to: r.belong_table_id,
          join: r.join,
          conditions: _.map(r.Conditions, cond => {
            return {
              belongField: cond.belong_field,
              mainField: cond.main_field,
              relationCondition: cond.relation_condition
            };
          })
        };
      });

      sql = joinRelationTable({ tables, relations, filter: this.dbfilter });
    } else if (source_type === 'SQL') {
      sql = source_sql;
    } else {
      throw new YoHoException('视图类型错误');
    }
    return `(${sql})`;
  }
  _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  _appendArray(group, col) {
    let exists;

    if (typeof col === 'string') {
      exists = _.some(group, g => g === col);
    } else if (col.length && typeof _.last(col) === 'string') {
      exists = _.some(group, g => _.last(g) === _.last(col));
    } else if (col.length) {
      exists = true;
      group = group.concat(col);
    }
    if (!exists) {
      group.push(col);
    }
    return group;
  }
  _isMeasure(title) {
    const { Columns } = this.source;
    const field = _.find(Columns, f => `${f.table_alias_name ? `${f.table_alias_name}_` : ''}${f.field_name}` === title);

    if (field) {
      return field.field_ori_type && !/text|character|timestamp/.test(field.field_ori_type);
    } else {
      throw new YoHoException('字段不在列表内');
    }
  }
  _parseCalcGroup(v) {
    const value = v.calc.value;
    const maths = _.join(_.map(CALC_TYPE, m => m.title), '|');
    const regMath = new RegExp(`(${maths})\\([^\\)]+\\)\\)?`, 'g');
    const cols = [];

    v.calc.value = value.replace(regMath, (val, math) => {
      this.calcIndex++;
      const calcId = `$CALC_${this.calcIndex}`;

      cols.push([Sequelize.literal(val), calcId]);
      this.calcGroupFields[calcId] = {
        options: {
          valueType: math,
        },
        title: calcId
      };
      return calcId;
    });
    return cols;
  }
  _castMeasure(v) {
    let col;
    const valueType = _.get(v, 'options.valueType', 'SUM');

    if (v.calc) {
      const regField = /\[([^\]]+)\]/g;
      let value = v.calc.value;

      value = value.replace(regField, (match, matchValue) => {
        if (this._isMeasure(matchValue)) {
          return `"${matchValue}"`;
        } else {
          return `CAST("${matchValue}" AS DOUBLE PRECISION)`;
        }
      });
      v.calc.value = value;

      if (v.calc.type === 'GROUP') {
        col = this._parseCalcGroup(v);
      } else {
        col = [Sequelize.fn(_.toUpper(valueType), Sequelize.literal(value)), v.title];
      }
    } else {
      let field = Sequelize.col(v.title);

      if (valueType === 'DISTINCT') {
        field = Sequelize.fn(valueType, field);
        col = [Sequelize.fn('COUNT', field), v.title];
      } else {
        if (!this._isMeasure(v.title) && (
          valueType === 'AVG' || valueType === 'SUM' || valueType === 'MIN' || valueType === 'MAX')) {
          field = Sequelize.cast(field, 'DOUBLE PRECISION');
        }
        col = [Sequelize.fn(_.toUpper(valueType), field), v.title];
      }
    }

    return col;
  }
  _castDimension(r) {
    let col;

    if (r.calc) {
      const regField = /\[([^\]]+)\]/g;
      const fields = [];
      let value = r.calc.value;
      let result;

      while (result = regField.exec(value)) { //eslint-disable-line
        fields.push(result[1]);
      }
      _.each(fields, f => (value = value.replace(`[${f}]`, `"${f}"`)));

      col = Sequelize.literal(value);
    } else {
      col = r.title;
    }

    return col;
  }
  _convertLine(rowGroups, rows, level = 0, payload = {}) {
    let rowsData = [];

    _.each(rowGroups[level], row => {
      const copyPayload = Object.assign({
        [rows[level].title]: row
      }, payload);

      if (level < rows.length - 1) {
        const data = this._convertLine(rowGroups, rows, level + 1, copyPayload);

        rowsData = rowsData.concat(data);
      } else {
        rowsData.push(copyPayload);
      }
    });
    return rowsData;
  }
  _convertRowsByColumns({ columnsGroups, columnEnums, columns }, level = 0, levelColumns = []) {
    if (columnEnums[level]) {
      const cols = {};

      _.each(columnEnums[level], column => {
        const childLevelColumns = levelColumns.concat([column]);

        const colData = this._convertRowsByColumns({ columnsGroups, columnEnums, columns }, level + 1, childLevelColumns);

        if (!_.isEmpty(colData)) {
          cols[column] = colData;
        }
      });
      return cols;
    } else {
      const columnKey = _.join(levelColumns, '');

      return columnsGroups[columnKey];
    }
  }
  _mergeValue(data, val) {
    let mergeData;

    if (val.calc && val.calc.type === 'GROUP') {
      const calcResult = val.calc.value.replace(/\$CALC_\d+/g, match => {
        const calcField = this.calcGroupFields[match];

        return calcField ? this._mergeValue(data, calcField) : 0;
      });

      mergeData = eval(calcResult); //eslint-disable-line
    } else {
      switch (val.options && val.options.valueType || 'SUM') { // 计算字段有bug
        case 'SUM':
        case 'DISTINCT':
        case 'COUNT':
          mergeData = _.sumBy(data, c => {
            return parseFloat(c.rows[val.title]) || 0;
          });
          break;
        case 'AVG':
          mergeData = _.round(_.sumBy(data, c => {
            return parseFloat(c.rows[val.title]) || 0;
          }) / data.length, 2);
          break;
        case 'MIN':
          mergeData = _.minBy(data, `rows.${val.title}`).rows[val.title] || 0;
          break;
        case 'MAX':
          mergeData = _.maxBy(data, `rows.${val.title}`).rows[val.title] || 0;
          break;
        default:
      }
    }

    return mergeData;
  }
  _mergeRows(uniqueRows, values) {
    _.each(uniqueRows, rowVal => {
      _.each(rowVal.columns, (colVal, colKey) => {
        let mergeData = {};

        _.each(values, val => {
          mergeData[val.title] = this._mergeValue(colVal, val);
        });
        rowVal.columns[colKey] = mergeData;
      });
    });
    return uniqueRows;
  }
  _getFilterMeasureGroup(uniqueRows, columns, filters) {
    const filterMeasureGroup = {};
    const filterRows = _.filter(uniqueRows, (uniRow) => {
      const columnKeys = Object.keys(uniRow.columns);

      _.each(columnKeys, colKey => {
        const valid = _.every(filters, f => {
          const val = _.parseInt(uniRow.columns[colKey][f.title]);

          if (!filterMeasureGroup[f.title]) {
            filterMeasureGroup[f.title] = { min: val, max: val };
          }
          if (filterMeasureGroup[f.title].min > val) {
            filterMeasureGroup[f.title].min = val;
          } else if (filterMeasureGroup[f.title].max < val) {
            filterMeasureGroup[f.title].max = val;
          }
          if (!f.val) {
            return true;
          }
          return val >= +f.val[0] && val <= +f.val[1];
        });

        if (!valid && uniRow.columns[colKey]) {
          delete uniRow.columns[colKey];
        }
      });
      return Object.keys(uniRow.columns).length > 0;
    });

    return { filterRows, filterMeasureGroup };
  }
  _getUniqueRows(sources, rows, columns, values, filters) {
    let lines = {};
    const dimensionFilter = _.filter(filters, f => f.type === 'D');
    const measureFilter = _.filter(filters, f => f.type === 'M');
    const filtersGroup = {};

    _.each(sources, item => {
      let rowKey = '', columnKey = '';
      const rowData = {};
      let filter = true;

      _.each(dimensionFilter, f => {
        if (!filtersGroup[f.title]) {
          filtersGroup[f.title] = new Set();
        }
        if (f.options.filterType === 'DateLimit') {
          const [start, end] = f.val;

          if (start && end) {
            const startDate = dayjs(start);
            const endDate = dayjs(end);
            const date = dayjs(item[f.title]);

            if (!date.isValid() || date < startDate || date > endDate) {
              filter = false;
              return false;
            }
          }
        } else {
          filtersGroup[f.title].add(item[f.title]);
          if (f.val) {
            const valid = item[f.title] === f.val;

            if (!valid) {
              filter = false;
              return false;
            }
          }
        }
      });

      if (!filter) {
        return;
      }

      _.each(rows, r => {
        rowKey += item[r.title];
        rowData[r.title] = item[r.title];
      });
      _.each(columns, c => {
        columnKey += item[c.title];
      });
      if (!lines[rowKey]) {
        lines[rowKey] = {
          data: rowData,
          filters: {},
          columns: {
            [columnKey]: []
          }
        };
      }
      if (!lines[rowKey].columns[columnKey]) {
        lines[rowKey].columns[columnKey] = [];
      }
      lines[rowKey].columns[columnKey].push({
        rows: item
      });
    });
    const uniqueRows = this._mergeRows(lines, values);
    const { filterRows, filterMeasureGroup } = this._getFilterMeasureGroup(uniqueRows, columns, measureFilter);

    _.each(dimensionFilter, ({ title }) => {
      filtersGroup[title] = Array.from(filtersGroup[title] || []);
    });

    Object.assign(filtersGroup, filterMeasureGroup);

    return { uniqueRows: filterRows, filtersGroup };
  }
  _processData({ sources, columns, rows, orders, values, filters }) {
    let rowsData = [];
    const columnEnums = _.map(columns, c => {
      return Object.keys(_.groupBy(sources, c.title));
    });

    const { uniqueRows, filtersGroup } = this._getUniqueRows(sources, rows, columns, values, filters);

    _.each(uniqueRows, rowData => {
      const colData = this._convertRowsByColumns({ columnsGroups: rowData.columns, columnEnums, columns });

      rowsData.push(Object.assign({}, rowData.data, colData));
    });
    rowsData = this._sortRows({ rows: rowsData, ...orders });
    const filterEnums = this._sortFitlerDropDown(filtersGroup);

    return { rowsData, columnEnums, filterEnums };
  }
  _sortRows({ rows, column, order }) {
    return _.orderBy(rows, row => {
      return _.get(row, column, 0);
    }, order);
  }
  _sortFitlerDropDown(filterEnums) {
    _.each(Object.keys(filterEnums), key => {
      filterEnums[key] = _.orderBy(filterEnums[key], v => v, 'desc');
    });
    return filterEnums;
  }
  _processCategory(arrays) {
    const categoryFields = _.filter(arrays, arr => arr.categorys);

    _.each(categoryFields, ({ level, categorys, title }) => {
      const categoryOrder = _.findIndex(arrays, arr => arr.title === title);

      arrays.splice(categoryOrder, 1, categorys[level]);
    });

    return arrays;
  }
}

module.exports = WorksheetProcess;
