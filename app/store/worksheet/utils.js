import _ from 'lodash';


export const getDefaultValueOptions = (value) => {
  let valueType;

  if (!value || /text|character|timestamp/.test(value.fieldType) || !value.fieldType) {
    valueType = 'COUNT';
  } else {
    valueType = 'SUM';
  }
  return {
    valueType
  };
};

export const getDefaultFilterOptions = (value) => {
  const options = {};

  if (value.type === 'D') {
    options.filterType = 'Dropdown';
  } else if (value.type === 'M') {
    options.filterType = 'Limit';
  }
  return options;
};

export const getDefaultMeasureOptions = () => {
  return {
  };
};


export const getDefaultDimensionOptions = () => {
  return {
  };
};


export const getCalcFieldTitle = (state) => {
  const {dimensions, measures} = state;
  const calcs = _.map(_.filter(_.concat(dimensions, measures), m => m.calc), calc => {
    const titleSps = _.split(calc.title, '_');

    return _.parseInt(titleSps[1]);
  });

  return `calc_${(_.max(calcs) || 0) + 1}`;
};
export const getCategoryFieldTitle = (state) => {
  const {dimensions, measures} = state;
  const categorys = _.map(_.filter(_.concat(dimensions, measures), m => m.categorys), cate => {
    const titleSps = _.split(cate.title, '_');

    return _.parseInt(titleSps[1]);
  });

  return `category_${(_.max(categorys) || 0) + 1}`;
};

export const arraysChange = (arrays, order, appends, removes = []) => {
  if (removes.length) {
    arrays = arrays.filter(arr => !_.some(removes, rm => rm.title === arr.title));
  }
  if (appends.length) {
    _.each(removes, rItem => {
      if (rItem.order < order) {
        order--;
      }
    });
    arrays.splice(order, 0, ...appends);
  }
  return arrays;
};
export const arraysOrder = arrays => {
  _.each(arrays, (i, index) => {
    i.order = index;
  });
};
export const categorysRemove = (arrays, removeValue) => {
  const categoryTitle = removeValue.parentCategory.title;
  const category = _.find(arrays, arr => arr.title === categoryTitle);

  category.categorys = _.filter(category.categorys, val => val.title !== removeValue.title);
  delete removeValue.parentCategory;

  if (category.categorys.length === 1) {
    const orderCategory = _.find(arrays, arr => arr.title === categoryTitle);
    const appendValue = orderCategory.categorys[0];

    delete appendValue.parentCategory;
    arrays = arraysChange(arrays, orderCategory.order, [appendValue], [orderCategory]);
  } else {
    arraysOrder(category.categorys);
  }
  return arrays;
};

export const sortSourseFields = (fields) => {
  let tempTableName;

  return _.map(_.sortBy(fields, s => s.tableAliasName), s => {
    if (tempTableName !== s.tableName) {
      s.showTableName = s.tableName;
      tempTableName = s.tableName;
    } else {
      delete s.showTableName;
    }
    return s;
  });
};

export const mapDimensions = sources => {
  const measures = _.map(_.filter(sources, s => s.type === 'D'), s => {
    return Object.assign({
      options: getDefaultMeasureOptions()
    }, s);
  });

  return sortSourseFields(measures);
};

export const mapMeasures = sources => {
  const measures = _.map(_.filter(sources, s => s.type === 'M'), s => {
    return Object.assign({
      options: getDefaultMeasureOptions()
    }, s);
  });

  return sortSourseFields(measures);
};

export const mapFilters = filters => {
  _.each(filters, f => {
    if (!f.options.filterType) {
      f.options.filterType = f.type === 'D' ? 'Dropdown' : 'Limit';
    }
  });

  return filters;
};
export const getDefaultOptions = (value, type) => {
  switch (type) {
    case 'value':
      return getDefaultValueOptions(value);
    case 'filter':
      return getDefaultFilterOptions(value);
    default:
      return {};
  }
};
