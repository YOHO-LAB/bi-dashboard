import _ from 'lodash';

export const convertRowsByColumns = (columnsDatas, level = 1, prop = '') => {
  const rows = {};
  let total = 0;

  _.each(columnsDatas, column => {
    const currentProp = `${prop ? `${prop}.` : ''}${column.prop}`;
    const buildColumns = {
      count: 0,
      deep: 0,
      level,
      value: Object.assign({}, column, {
        prop: currentProp
      })
    };

    if (column.childrens) {
      const {rows: childRows, count: childCount} = convertRowsByColumns(column.childrens, level + 1, currentProp);
      let topDeep = 0;

      _.each(childRows, (row, childLevel) => {
        if (!rows[childLevel]) {
          rows[childLevel] = [];
        }
        rows[childLevel] = rows[childLevel].concat(row);
        childLevel = _.parseInt(childLevel);
        topDeep = childLevel > topDeep ? childLevel : topDeep;
      });
      buildColumns.count = childCount;
      buildColumns.deep = topDeep - level;
      total += childCount;
    } else {
      total++;
    }
    if (!rows[level]) {
      rows[level] = [];
    }
    rows[level].push(buildColumns);
  });
  return {rows, count: total};
};

export const convertTableData = (columns) => {
  const buildColumns = [];
  const {rows} = convertRowsByColumns(columns);

  const topDeep = Object.keys(rows).length;
  const columnsData = [];

  _.each(rows, cols => {
    const column = [];

    _.each(cols, col => {
      column.push({
        colspan: col.count + (col.count ? 0 : 1),
        rowspan: 1 + (topDeep - (col.level + col.deep)),
        value: col.value,
        deep: col.deep === 0,
        sort: ''
      });
      if (col.deep === 0) {
        columnsData.push(col.value);
      }
    });
    buildColumns.push(column);
  });
  return {buildColumns, columnsData};
};

const filterColumnComponent = (component) => {
  return component.componentOptions && component.componentOptions.tag === 'bi-table-column';
};

export const getDataByComponents = (components) => {
  const columns = [];
  const columnComponents = _.filter(components, filterColumnComponent);

  _.each(columnComponents, ({componentOptions: {propsData, children}}) => {
    const column = Object.assign({}, propsData);

    if (_.some(children, filterColumnComponent)) {
      column.childrens = getDataByComponents(children);
    }
    columns.push(column);
  });
  return columns;
};


export const sortRowsData = (rows, {column, order}) => {
  return _.orderBy(rows, row => {
    return _.get(row, column, 0);
  }, order);
};
