import * as Types from './types';

export default {
  [Types.STATEMENT_ALL_VIEWS_REQUEST](state, {page, size}) {
    state.fetching = true;
    state.page = page;
    state.size = size;
  },
  [Types.STATEMENT_ALL_VIEWS_REQUEST_SUCCESS](state, {count}) {
    state.fetching = false;
    state.count = count;
  },
  [Types.STATEMENT_DATA_REQUEST](state) {
    state.fetching = true;
  },
  [Types.STATEMENT_DATA_REQUEST_SUCCESS](state) {
    state.fetching = false;
  },
  [Types.STATEMENT_WORKSHEET_DETAIL_REQUEST](state) {
    state.fetching = true;
  },
  [Types.STATEMENT_WORKSHEET_FILTER_REQUEST](state) {
    state.fetching = true;
  },
  [Types.STATEMENT_WORKSHEET_DETAIL_REQUEST_SUCCESS](state) {
    state.fetching = false;
  },
  [Types.STATEMENT_WORKSHEET_FILTER_REQUEST_SUCCESS](state) {
    state.fetching = false;
  },
  [Types.STATEMENT_PROJECTS_REQUEST](state, {page, size}) {
    state.fetching = true;
    state.project.page = page;
    state.project.size = size;
  },
  [Types.STATEMENT_PROJECTS_REQUEST_SUCCESS](state, {count}) {
    state.fetching = false;
    state.project.count = count;
  },
  [Types.STATEMENT_PROJECT_VIEWS_REQUEST](state, {page, size}) {
    state.fetching = true;
    state.view.page = page;
    state.view.size = size;
  },
  [Types.STATEMENT_PROJECT_VIEWS_REQUEST_SUCCESS](state, {count}) {
    state.fetching = false;
    state.view.count = count;
  }
};
