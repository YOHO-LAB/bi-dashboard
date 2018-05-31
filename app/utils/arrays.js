import _ from 'lodash';

const sliceArrays = (arrs, page, size, order) => {
  const start = (page - 1) * size;
  const end = (arrs.length < page * size) ? arrs.length : page * size;
  let tempArrs;

  if (order) {
    tempArrs = _.orderBy(arrs, row => {
      return _.get(row, order.column, 0);
    }, order.order);
  } else {
    tempArrs = arrs;
  }
  return tempArrs.slice(start, end);
};

export default {
  sliceArrays
};
