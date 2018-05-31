import * as Types from './types';
import _ from 'lodash';
import {
  getDefaultOptions,
  getDefaultValueOptions,
  getDefaultFilterOptions,
  mapDimensions,
  mapMeasures,
  mapFilters,
  getCalcFieldTitle,
  getCategoryFieldTitle,
  arraysChange,
  arraysOrder,
  categorysRemove,
  sortSourseFields
} from './utils';
import Vue from 'vue';

export default {
  [Types.FETCH_WORKSHEETS_REQUEST](state) {
    state.fetchWorksheeting = true;
  },
  [Types.FETCH_WORKSHEETS_SUCCESS](state, {worksheet, project_id}) {
    state.fetchWorksheeting = false;
    Vue.set(state.worksheets, project_id, worksheet);
  },
  [Types.SAVE_WORKSHEET_BASE_SUCCESS](state, {project_id, id, worksheet_name}) {
    if (state.worksheets[project_id]) {
      const worksheet = _.find(state.worksheets[project_id], w => w.id === id);

      worksheet.worksheet_name = worksheet_name;
    }
  },
  [Types.FETCH_WORKSHEET_SUCCESS](state, {worksheet, id}) {
    state.fetchView = false;
    state.worksheetId = id;
    const {worksheet_data} = worksheet;

    if (worksheet_data) {
      const {sources, values, columns, rows, orders, filters, worksheetResultType} = JSON.parse(worksheet_data);

      state.dimensions = mapDimensions(sources);
      state.measures = mapMeasures(sources);
      state.values = values;
      state.columns = columns;
      state.rows = rows;
      state.orders = orders;
      state.filters = mapFilters(filters);
      state.worksheetResultType = worksheetResultType || 'table';
    }
  },
  [Types.FETCH_WORKSHEET_FIELDS_SUCCESS](state, {sources, id}) {
    sources = _.map(sources, s => {
      return {
        title: s.fieldName,
        alias: s.fieldAlias,
        type: s.fieldType,
        fieldType: s.fieldOriType,
        tableId: s.tableId,
        tableName: s.tableName,
        tableSchemeName: s.tableSchemeName,
        tableAliasName: s.tableAliasName
      };
    });
    state.sourceId = id;
    state.dimensions = mapDimensions(sources);
    state.measures = mapMeasures(sources);
  },
  [Types.DRAG_VALUE_ACCPET](state, {fromId, toId, fromValue, toValue, copy}) {
    if (!copy) {
      state[`${fromId}s`] = _.filter(state[`${fromId}s`], v => v.title !== fromValue.title);
    } else {
      fromValue = _.clone(fromValue);
    }

    if (toId) {
      if (_.some(state[`${toId}s`], v => v.title === fromValue.title)) {
        return;
      }
      fromValue.options = getDefaultOptions(fromValue, toId);
      const order = toValue ? _.findIndex(state[`${fromId}s`], v => v.title === toValue.title) : -1;

      if (toId === 'measure') {
        fromValue.type = 'M';
      } else if (toId === 'dimension') {
        fromValue.type = 'D';
      }

      if (order >= 0) {
        state[`${toId}s`].splice(order + 1, 0, fromValue);
      } else {
        state[`${toId}s`].push(fromValue);
      }
      if (fromValue.parentCategory) {
        state[`${fromId}s`] = categorysRemove(state[`${fromId}s`], fromValue);
      }
      if (toId === 'measure' || toId === 'dimension') {
        state[`${fromId}s`] = sortSourseFields(state[`${fromId}s`]);
        state[`${toId}s`] = sortSourseFields(state[`${toId}s`]);
      }
    }
  },
  [Types.DRAG_VALUE_HOVER](state, {id, fromValue, toValue, name}) {
    const categoryValue = {
      title: getCategoryFieldTitle(state),
      level: 0,
      alias: name,
      type: 'D',
      active: false,
      tableAliasName: toValue.tableAliasName,
      tableName: toValue.tableName,
      tableSchemeName: toValue.tableSchemeName
    };

    if (fromValue.categorys && toValue.categorys) {
      categoryValue.categorys = fromValue.categorys.concat(toValue.categorys);
    } else if (toValue.categorys) {
      categoryValue.categorys = toValue.categorys;
      categoryValue.categorys.push(fromValue);
    } else if (fromValue.categorys) {
      categoryValue.categorys = fromValue.categorys;
      categoryValue.categorys.splice(0, 0, toValue);
    } else {
      categoryValue.categorys = [toValue, fromValue];
    }
    state[`${id}s`] = _.filter(state[`${id}s`], v => v.title !== fromValue.title);
    const order = toValue ? _.findIndex(state[`${id}s`], v => v.title === toValue.title) : -1;

    state[`${id}s`] = _.filter(state[`${id}s`], v => v.title !== toValue.title);


    if (order >= 0) {
      state[`${id}s`].splice(order, 0, categoryValue);
    } else {
      state[`${id}s`].push(categoryValue);
    }

    if (fromValue.parentCategory) {
      state[`${id}s`] = categorysRemove(state[`${id}s`], fromValue);
    }
    _.each(categoryValue.categorys, (cate, index) => {
      cate.parentCategory = {
        title: categoryValue.title,
        count: categoryValue.categorys.length
      };
      cate.order = index;
    });
    state[`${id}s`] = sortSourseFields(state[`${id}s`]);
  },
  [Types.ACCPET_VALUE](state, {targetType, order, value}) {
    const currentValue = _.clone(value);
    let arrays = [];

    switch (targetType) {
      case 'VALUE':
        currentValue.options = getDefaultValueOptions(currentValue);
        arrays = state.values = arraysChange(state.values, order, [currentValue],
          _.filter(state.values, arr => arr.title === currentValue.title));
        break;
      case 'COLUMN':
        arrays = state.columns = arraysChange(state.columns, order, [currentValue],
          _.filter(state.columns, arr => arr.title === currentValue.title));
        break;
      case 'ROW':
        arrays = state.rows = arraysChange(state.rows, order, [currentValue],
          _.filter(state.rows, arr => arr.title === currentValue.title));
        break;
      case 'FILTER':
        currentValue.options = getDefaultFilterOptions();
        arrays = state.filters = arraysChange(state.filters, order, [currentValue],
          _.filter(state.filters, arr => arr.title === currentValue.title));
        break;
      case 'MEASURE':
        currentValue.type = 'M';
        state.measures.push(currentValue);
        state.measures = sortSourseFields(state.measures);
        break;
      case 'DIMENSION':
        currentValue.type = 'D';
        state.dimensions.push(currentValue);
        state.dimensions = sortSourseFields(state.dimensions);
        break;
      default:
        break;
    }

    arraysOrder(arrays);

    if (targetType === 'DIMENSION' && currentValue.parentCategory) {
      arrays = state.dimensions = categorysRemove(state.dimensions, currentValue);
      arraysOrder(arrays);
    }
  },
  [Types.REMOVE_VALUE](state, {fromType, value}) {
    let arrays = [];

    switch (fromType) {
      case 'VALUE':
        state.values = arraysChange(state.values, 0, [], [value]);
        arrays.push(state.values);
        break;
      case 'COLUMN':
        state.columns = arraysChange(state.columns, 0, [], [value]);
        arrays.push(state.columns);
        break;
      case 'ROW':
        state.rows = arraysChange(state.rows, 0, [], [value]);
        arrays.push(state.rows);
        break;
      case 'FILTER':
        state.filters = arraysChange(state.filters, 0, [], [value]);
        arrays.push(state.filters);
        break;
      case 'MEASURE':
        state.measures = sortSourseFields(_.filter(state.measures, m => m.title !== value.title));
        state.values = arraysChange(state.values, 0, [], [value]);
        state.filters = arraysChange(state.filters, 0, [], [value]);
        arrays.push(state.measures);
        arrays.push(state.values);
        arrays.push(state.filters);
        break;
      case 'DIMENSION':
        state.dimensions = sortSourseFields(_.filter(state.dimensions, m => m.title !== value.title));
        state.filters = arraysChange(state.filters, 0, [], [value]);
        state.columns = arraysChange(state.columns, 0, [], [value]);
        state.rows = arraysChange(state.rows, 0, [], [value]);
        arrays.push(state.dimensions);
        arrays.push(state.filters);
        arrays.push(state.columns);
        arrays.push(state.rows);
        break;
      default:
        break;
    }
    _.each(arrays, array => {
      arraysOrder(array);
    });
  },
  [Types.FETCH_DATA_REQUEST](state) {
    state.fetchDashboarding = true;
    state.worksheetError = '';
  },
  [Types.FETCH_DATA_SUCCESS](state) {
    state.fetchDashboarding = false;
    state.worksheetError = '';
  },
  [Types.FETCH_DATA_FAILD](state, {error}) {
    state.fetchDashboarding = false;
    state.worksheetError = _.get(error, 'message', '');
  },
  [Types.WORKSHEET_PAGE_CHANGE]() {
  },
  [Types.FETCH_WORKSHEET_REQUEST](state) {
    state.fetchView = true;
  },
  [Types.SORT_CHANGE](state, {column, order}) {
    if (order === 'normal') {
      state.orders = {};
    } else {
      state.orders = {
        column,
        order
      };
    }
  },
  [Types.FILTER_CHANGE](state, {value, val}) {
    const filter = _.find(state.filters, f => f.title === value.title);

    if (filter) {
      filter.val = val;
    }
  },
  [Types.RESET_WORKSHEET_DATA](state, payload) {
    Object.assign(state, {
      sourceId: 0,
      worksheetId: 0,
      dimensions: [],
      measures: [],
      values: [],
      columns: [],
      rows: [],
      orders: {},
      filters: [],
      fetchView: false,
      worksheetResultType: 'table',
      viewData: {},
    }, payload);
  },
  [Types.RENAME_VALUE](state, {title, name}) {
    +((rename) => {
      _.each(state.dimensions, rename);
      _.each(state.measures, rename);
      _.each(state.values, rename);
      _.each(state.columns, rename);
      _.each(state.rows, rename);
      _.each(state.filters, rename);

      if (!_.isEmpty(state.viewData)) {
        state.viewData = Object.assign({}, state.viewData);
      }
    })((val) => {
      if (val.title === title) {
        Vue.set(val, 'alias', name);
      }
    });
  },
  [Types.CHANGE_VALUE_OPTION](state, {value, target, val}) {
    if (!value.options) {
      Vue.set(value, 'options', {
        [target]: val
      });
    } else {
      value.options[target] = val;
    }
  },
  [Types.ADD_CATEGORY_FIELD](state, {value, secondValue, name}) {
    const categoryValue = {
      title: getCategoryFieldTitle(state),
      level: 0,
      alias: name,
      type: 'D',
      active: false,
    };
    const order = value.order;

    if (value.categorys) {
      categoryValue.categorys = value.categorys;
      categoryValue.categorys.push(secondValue);
    } else if (secondValue.categorys) {
      categoryValue.categorys = secondValue.categorys;
      categoryValue.categorys.splice(0, 0, value);
    } else if (value.categorys && secondValue.categorys) {
      categoryValue.categorys = value.categorys.concat(secondValue.categorys);
    } else {
      categoryValue.categorys = [value, secondValue];
    }
    state.dimensions = arraysChange(state.dimensions, order, [categoryValue], [value, secondValue]);

    if (secondValue.parentCategory) {
      state.dimensions = categorysRemove(state.dimensions, secondValue);
    }

    _.each(categoryValue.categorys, (cate, index) => {
      cate.parentCategory = {
        title: categoryValue.title,
        count: categoryValue.categorys.length
      };
      cate.order = index;
    });
    arraysOrder(state.dimensions);
  },
  [Types.ADD_CALC_FIELD](state, {value: calcValue}) {
    if (!calcValue.title) {
      calcValue.title = getCalcFieldTitle(state);
    }
    if (calcValue.type === 'M') {
      const measure = _.find(state.measures, m => m.title === calcValue.title);

      if (measure) {
        Object.assign(measure, calcValue);
        const value = _.find(state.values, m => m.title === calcValue.title);
        const filter = _.find(state.filters, m => m.title === calcValue.title);

        if (value) {
          Object.assign(value, calcValue);
        }
        if (filter) {
          Object.assign(filter, calcValue);
        }
      } else {
        calcValue.options = getDefaultValueOptions(calcValue);
        if (calcValue.calc && calcValue.calc.type === 'GROUP') {
          calcValue.options.valueType = '';
        }
        state.values.push(calcValue);
        state.measures.push(calcValue);
      }
    } else if (calcValue.type === 'D') {
      const dimension = _.find(state.dimensions, m => m.title === calcValue.title);

      if (dimension) {
        const filter = _.find(state.filters, m => m.title === calcValue.title);
        const row = _.find(state.rows, m => m.title === calcValue.title);
        const column = _.find(state.columns, m => m.title === calcValue.title);

        if (row) {
          Object.assign(row, calcValue);
        }
        if (column) {
          Object.assign(column, calcValue);
        }
        if (filter) {
          Object.assign(filter, calcValue);
        }

      } else {
        state.rows.push(calcValue);
        state.dimensions.push(calcValue);
      }
    }
  },
  [Types.REMOVE_SOURCE_FIELD](state, {value}) {
    if (value.type === 'M') {
      state.values = state.values.filter(v => v.title !== value.title);
      state.measures = state.measures.filter(v => v.title !== value.title);
    } else if (value.type === 'D') {
      state.rows = state.rows.filter(v => v.title !== value.title);
      state.dimensions = state.dimensions.filter(v => v.title !== value.title);
    }
  },
  [Types.TOGGLE_CATEGORY_ACTIVE](state, {value}) {
    value.active = !value.active;
  },
  [Types.CHANGE_CATEGORY_ORDER](state, {value, type}) {
    const currentOrder = value.order + (type === 'up' ? -1 : 1);
    const category = _.find(state.dimensions, d => d.title === value.parentCategory.title);

    category.categorys = _.filter(category.categorys, cate => cate.title !== value.title);
    category.categorys.splice(currentOrder, 0, value);
    arraysOrder(category.categorys);
  },
  [Types.EXPAND_CATEGORY](state, {value, type}) {
    const {categorys, level} = value;

    if (categorys.length <= level + 1) {
      return;
    }
    if (type === 'row') {
      const order = _.findIndex(state.rows, r => r.title === value.title);

      state.rows.splice(order + 1, 0, categorys[level]);
    } else if (type === 'column') {
      const order = _.findIndex(state.columns, r => r.title === value.title);

      state.columns.splice(order + 1, 0, categorys[level]);
    }
    value.level++;
  },
  [Types.BACK_CATEGORY](state, {value, type}) {
    let category;

    if (type === 'row') {
      state.rows = _.filter(state.rows, r => r.title !== value.title);
      category = _.find(state.rows, row => row.title === value.parentCategory.title);
    } else if (type === 'column') {
      state.columns = _.filter(state.columns, r => r.title !== value.title);
      category = _.find(state.columns, column => column.title === value.parentCategory.title);
    }
    category.level--;
  },
  [Types.SAVE_WORKSHEET_DATA_REQUEST](state) {
    state.saveingWorksheet = true;
  },
  [Types.SAVE_WORKSHEET_DATA_SUCCESS](state) {
    state.saveingWorksheet = false;
  },
  [Types.SAVE_WORKSHEET_DATA_FAILD](state, {error}) {
    state.saveingWorksheet = false;
    state.worksheetError = _.get(error, 'message', '');
  },
  [Types.OUTPUT_WORKSHEET_DATA_REQUEST](state) {
    state.saveingWorksheet = true;
  },
  [Types.OUTPUT_WORKSHEET_DATA_SUCCESS](state) {
    state.saveingWorksheet = false;
  },
  [Types.OUTPUT_WORKSHEET_DATA_FAILD](state) {
    state.saveingWorksheet = false;
  },
  [Types.UPDATE_HISTORY](state, {baseIndex, currentIndex, historyLength, startIndex}) {
    state.history = {baseIndex, currentIndex, historyLength, startIndex};
  },
  [Types.HISTORY_REVERT]() {},
  [Types.HISTORY_BACK]() {},
  [Types.HISTORY_FORWORD]() {},
  [Types.HISTORY_UPDATE_WORKSHEET](state, payload) {
    Object.assign(state, payload);
  },
  [Types.SET_LOCAL_WORKSHEET_STATUS](state) {
    state.haveNoSave = true;
  },
  [Types.LOAD_LOCAL_WORKSHEET]() {},
  [Types.CLEAR_LOCAL_WORKSHEET]() {},
  [Types.SWITCH_RESULT_TYPE](state, {type}) {
    state.worksheetResultType = type;
  }
};
