import _ from 'lodash';

export default value => {
  if (_.isNumber(value)) {
    return _.round(value, 2);
  } else {
    return value;
  }
};
