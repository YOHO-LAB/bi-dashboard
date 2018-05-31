const _ = require('lodash');
const XLSX = require('xlsx-style');

const existsColumns = (colpath, rowsData) => {
  return _.some(rowsData, rows => _.has(rows, _.join(colpath, '.')));
};
const getColumnsToRows = (columns, rowsData, level = 0, colpath = []) => {
  let rows = [];

  _.each(columns[level], col => {
    const childColpath = [].concat(colpath, [col]);

    if (!existsColumns(childColpath, rowsData)) {
      return;
    }
    if (columns[level + 1]) {
      const childs = getColumnsToRows(columns, rowsData, level + 1, childColpath);

      _.each(childs, (childCol, index) => {
        let colItem = {
          value: col
        };

        if (index === 0) {
          colItem.f = true;
        }
        rows.push([colItem].concat(childCol));
      });

    } else {
      rows.push([{
        value: col,
        f: true
      }]);
    }
  });
  return rows;
};
const findMergeFromMatrix = rows => {
  const merges = [];

  _.each(rows, (cols, rowIndex) => {
    _.each(cols, (cell, colIndex) => {
      if (cell !== null) {
        if (cols[colIndex + 1] === null) {
          let endColindex = colIndex + 1;

          while (cols[endColindex] === null) {
            endColindex++;
          }

          merges.push({
            s: { r: rowIndex, c: colIndex },
            e: { r: rowIndex, c: endColindex - 1 }
          });
        }
        if (rows[rowIndex + 1] && rows[rowIndex + 1][colIndex] === null) {
          let endRowIndex = rowIndex + 1;

          while (rows[endRowIndex] && rows[endRowIndex][colIndex] === null) {
            endRowIndex++;
          }
          merges.push({
            s: { r: rowIndex, c: colIndex },
            e: { r: endRowIndex - 1, c: colIndex }
          });
        }
      }
    });
  });
  return merges;
};
const buildSheetFromMatrix = (data, options) => {
  const workSheet = {};

  _.each(data, (cols, rowIndex) => {
    _.each(cols, (cell, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex });

      if (typeof cell === 'object' && cell) {
        workSheet[cellRef] = cell;
      } else {
        workSheet[cellRef] = {
          v: cell || ''
        };
      }
    });
  });
  workSheet['!ref'] = XLSX.utils.encode_range({
    s: { c: 0, r: 0 },
    e: { c: data[0].length, r: data.length }
  });
  if (options.merges) {
    workSheet['!merges'] = options.merges;
  }
  return workSheet;
};
const getColumnsCell = cell => {
  return {
    v: cell,
    s: {
      alignment: {
        vertical: 'center',
      }
    }
  };
};


const exportExcel = (rows, columns, values, datas, name = '未命名') => {
  const allColumns = _.concat(datas.columnEnums, [_.map(values, v => v.title)]); // 列头的层级
  const columnRows = getColumnsToRows(allColumns, datas.rowsData); // 列转行
  const worksheetRows = _.fill(Array(allColumns.length), []); // 创建列头层级的数组
  const valuesCols = {};

  _.each(values, v => {
    valuesCols[v.title] = v;
  });
  worksheetRows[0] = _.map(rows, r => getColumnsCell(r.alias || r.title));
  _.each(columnRows, (row, cInx) => {
    for (let i = 0; i < allColumns.length; i++) {
      if (cInx === 0) {
        if (i > 0) {
          worksheetRows[i] = _.fill(Array(rows.length), null);
        }
      }
      let colValue;
      const colItem = row[i];

      if (colItem.f) {
        const value = valuesCols[colItem.value];

        if (value) {
          colValue = value.alias || value.title;
        } else {
          colValue = colItem.value;
        }
      } else {
        colValue = null;
      }
      worksheetRows[i].push(colValue);
    }
  });

  const merges = findMergeFromMatrix(worksheetRows);

  _.each(datas.rowsData, row => {
    let worksheetValueRow = [];

    _.each(rows, r => {
      worksheetValueRow.push(row[r.title]);
    });
    _.each(columnRows, cols => {
      const valueCol = valuesCols[_.last(cols).value];
      const valuePath = _.join(_.map(cols, c => c.value), '.');
      const value = _.get(row, valuePath, '');

      let precision = 2;
      const style = {};

      if (valueCol.options && valueCol.options.formatType) {
        switch (valueCol.options.formatType) {
          case 'PERCENT':
            style.numFmt = '0.00%';
            precision = 4;
            break;
          default:
            break;
        }
      }

      worksheetValueRow.push({
        v: valueCol.type === 'D' ? value : _.round(value, precision),
        t: valueCol.type === 'D' ? 's' : 'n',
        s: style
      });
    });

    worksheetRows.push(worksheetValueRow);
  });
  const options = {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary',
    merges
  };
  const workBook = {
    SheetNames: [name],
    Sheets: {
      [name]: buildSheetFromMatrix(worksheetRows, options)
    }
  };
  const excelData = XLSX.write(workBook, options);

  return excelData instanceof Buffer ? excelData : Buffer.from(excelData, 'binary');
};

module.exports = {
  exportExcel
};
