import _ from 'lodash';
import * as Types from './types';
import {BlobUtil} from 'utils';

export default {
  async [Types.STATEMENT_ALL_VIEWS_REQUEST]({commit, state}, {page, size}) {
    page = page || state.page;
    size = size || state.size;
    commit(Types.STATEMENT_ALL_VIEWS_REQUEST, {page, size});
    const result = await this.$api.get('/statement/fetch-views', {page, size});

    if (result && result.code === 200) {
      commit(Types.STATEMENT_ALL_VIEWS_REQUEST_SUCCESS, result.data);
    }
    return result;
  },
  async [Types.STATEMENT_DATA_REQUEST]({commit}, {view_id}) {
    const result = await this.$api.get('/statement/fetch-data', {
      view_id
    });

    if (result) {
      commit(Types.STATEMENT_DATA_REQUEST_SUCCESS, {data: result.data});
      return result;
    }
  },
  async [Types.STATEMENT_WORKSHEET_DETAIL_REQUEST]({commit, state}, {view_id, worksheet_ids, order}) {
    if (_.isNumber(worksheet_ids) && _.find(state.worksheetResults, {worksheet_id: worksheet_ids})) {
      return;
    }
    commit(Types.STATEMENT_WORKSHEET_DETAIL_REQUEST);
    const result = await this.$api.post('/statement/fetch-statement-result', {view_id, worksheet_ids});

    if (result) {
      commit(Types.STATEMENT_WORKSHEET_DETAIL_REQUEST_SUCCESS, {data: result.data, order});
    }
    return result;
  },
  async [Types.STATEMENT_WORKSHEET_FILTER_REQUEST]({commit}, {worksheetData, id, source_id}) {
    commit(Types.STATEMENT_WORKSHEET_FILTER_REQUEST);
    const result = await this.$api.post('/statement/fetch-worksheet-result', {
      values: worksheetData.values,
      columns: worksheetData.columns,
      rows: worksheetData.rows,
      filters: worksheetData.filters,
      id: id,
      source_id: source_id
    });

    if (result && result.code === 200) {
      commit(Types.STATEMENT_WORKSHEET_FILTER_REQUEST_SUCCESS);
    }
    return result;
  },
  async [Types.STATEMENT_PROJECT_VIEWS_REQUEST]({commit, state}, {project_id, page, size}) {
    page = page || state.view.page;
    size = size || state.view.size;
    commit(Types.STATEMENT_PROJECT_VIEWS_REQUEST, {page, size});
    const result = await this.$api.get('/statement/fetch-statement-project-views', {
      project_id, page, size
    });

    if (result && result.code === 200) {
      commit(Types.STATEMENT_PROJECT_VIEWS_REQUEST_SUCCESS, result.data);
    }
    return result;
  },
  async [Types.STATEMENT_PROJECTS_REQUEST]({commit, state}, {page, size}) {
    page = page || state.project.page;
    size = size || state.project.size;
    commit(Types.STATEMENT_PROJECTS_REQUEST, {page, size});
    const result = await this.$api.get('/statement/fetch-statement-projects', {page, size});

    if (result && result.code === 200) {
      commit(Types.STATEMENT_PROJECTS_REQUEST_SUCCESS, result.data);
    }
    return result;
  },
  async [Types.STATEMENT_FETCH_DASHBOARDS](action, {view_id}) {
    return await this.$api.post('/statement/fetch-dashboards', {view_id});
  },
  async [Types.STATEMENT_FETCH_DASHBOARDS_DETAIL](action, {filters, worksheetId, view_id}) {
    return await this.$api.post('/statement/fetch-dashboard-detail', {
      filters, worksheetId, view_id
    });
  },
  async [Types.STATEMENT_OUTPUT_DASHBOARD_REQUEST](action, payload) {
    const blobData = await this.$api.post('/statement/output-dashboard', payload, {
      responseType: 'blob'
    });

    if (blobData) {
      try {
        return await BlobUtil.resolveBlobData(blobData);
      } catch (error) {
        return error;
      }
    }
    return blobData;
  },
};
