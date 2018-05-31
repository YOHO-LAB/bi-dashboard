
import _ from 'lodash';

export const convertColumnToData = (columnData, value, length, level = 0) => {
  return _.map(columnData, (coldata, colName) => {
    const data = {
      name: colName,
    };

    if (level >= length - 1) {
      data.value = coldata[value.title];
    } else {
      const chilrens = _.filter(convertColumnToData(columnData[colName], value, length, level + 1), v => v);

      data.value = _.sumBy(chilrens, 'value');
      data.children = chilrens;
    }
    if (data.value === 0) {
      return;
    }
    return data;
  });
};
