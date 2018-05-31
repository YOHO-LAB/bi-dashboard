import * as Types from './types';
import _ from 'lodash';
import Vue from 'vue';

const reorderDashboards = (dashboards) => {
  _.each(dashboards, (w, index) => {
    w.order = index;
  });
};

export default {
  [Types.VIEW_FETCH_REQUEST]() {
  },
  [Types.VIEW_FETCH_SUCCESS](state, {data}) {
    state.viewData = Object.assign({}, data);
  },
  [Types.VIEW_WORKSHEETS_FETCH_REQUEST](state) {
    state.worksheets = [];
  },
  [Types.VIEW_WORKSHEETS_FETCH_SUCCESS](state, {worksheets}) {
    state.worksheets = worksheets;
  },
  [Types.VIEW_DASHBOARDS_REQUEST](state) {
    state.viewResultFetching = true;
    state.dashboards = [];
  },
  [Types.VIEW_WORKSHEET_RESULT_SUCCESS](state, {data}) {
    state.viewResultFetching = false;
    state.dashboards = _.map(_.orderBy(data, ['order']), d => {
      return Object.assign(d, {
        loading: true
      });
    });
  },
  [Types.VIEW_WORKSHEET_RESULT_MENU](state, {name, worksheet, order}) {
    if (name === 'up') {
      _.remove(state.worksheetResults, worksheet);
      state.worksheetResults.splice(order - 1, 0, worksheet);
    } else if (name === 'down') {
      _.remove(state.worksheetResults, worksheet);
      state.worksheetResults.splice(order + 1, 0, worksheet);
    } else if (name === 'remove') {
      state.worksheetResults = state.worksheetResults.filter(v => v.worksheet_id !== worksheet.worksheet_id);
      _.set(_.find(state.worksheets, {id: worksheet.worksheet_id}), 'active', false);
    }
  },
  [Types.VIEW_WORKSHEETS_DROP_ACTIVE](state) {
    _.each(state.worksheets, item => {
      if (_.find(state.worksheetResults, {worksheet_id: item.id})) {
        item.active = true;
      } else {
        item.active = false;
      }
    });
  },
  [Types.VIEW_DASHBOARD_REQUEST](state, {worksheetData, value, val}) {
    let filter = _.find(worksheetData.filters, f => f.title === value.title);

    if (filter) {
      filter.val = val;
    }
  },
  [Types.VIEW_WORKSHEET_FILTER_SUCCESS](state, {worksheetData, data}) {
    if (data) {
      Vue.set(worksheetData, 'viewData', data);
    }
  },
  [Types.OUTPUT_VIEW_DATA_REQUEST](state) {
    state.outputing = true;
  },
  [Types.OUTPUT_VIEW_DATA_SUCCESS](state) {
    state.outputing = false;
  },
  [Types.OUTPUT_VIEW_DATA_FAILD](state) {
    state.outputing = false;
  },
  [Types.APPEND_DASHBOARDS](state, {order, value}) {
    state.dashboards.splice(order, 0, {
      worksheet_id: value.id,
      worksheet_name: value.worksheet_name,
      worksheetResultType: value.worksheetResultType,
      order
    });
    reorderDashboards(state.dashboards);
  },
  [Types.DELETE_DASHBOARDS](state, {worksheet}) {
    state.dashboards = _.filter(state.dashboards, w => w.worksheet_id !== worksheet.worksheet_id);
    reorderDashboards(state.dashboards);
  },
  [Types.CHANGE_DASHBOARDS_ORDER](state, {worksheet, order}) {
    state.dashboards = _.filter(state.dashboards, w => w.worksheet_id !== worksheet.worksheet_id);
    state.dashboards.splice(order, 0, worksheet);
    reorderDashboards(state.dashboards);
  },
  [Types.CHANGE_DASHBOARDS_FILTER](state, {worksheet, filter}) {
    const find = _.find(state.dashboards, d => d.worksheet_id === worksheet.worksheet_id);

    if (find) {
      find.loading = true;
      const findFilter = _.find(find.filters, f => f.title === filter.value.title);

      findFilter.val = filter.val;
    }
  },
  [Types.CHANGE_DASHBOARDS_SORT](state, {worksheet, orders}) {
    const find = _.find(state.dashboards, d => d.worksheet_id === worksheet.worksheet_id);

    find.orders = orders;
  },
  [Types.FILL_DASHBOARDS_DETAIL](state, {worksheet_id, rows, values, columns, filters, orders}) {
    const find = _.find(state.dashboards, d => d.worksheet_id === worksheet_id);

    if (find) {
      Object.assign(find, {
        rows,
        values,
        columns,
        filters,
        orders,
        loading: false
      });
    }
  },
  [Types.CLEAR_DASHBOARS](state) {
    state.dashboards = [];
  }
};
