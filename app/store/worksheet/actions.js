import {
  FETCH_WORKSHEET_FIELDS_REQUEST,
  FETCH_WORKSHEET_FIELDS_SUCCESS,
  FETCH_DATA_REQUEST,
  FETCH_DATA_SUCCESS,
  FETCH_WORKSHEET_REQUEST,
  FETCH_WORKSHEET_SUCCESS,
  TEST_CALC_FIELD,
  SAVE_WORKSHEET_BASE,
  SAVE_WORKSHEET_BASE_SUCCESS,
  FETCH_WORKSHEETS_REQUEST,
  FETCH_WORKSHEETS_SUCCESS,
  SAVE_WORKSHEET_DATA_REQUEST,
  SAVE_WORKSHEET_DATA_SUCCESS,
  OUTPUT_WORKSHEET_DATA_REQUEST,
  OUTPUT_WORKSHEET_DATA_SUCCESS,
  OUTPUT_WORKSHEET_DATA_FAILD,
  FETCH_DATA_FAILD,
} from './types';
import _ from 'lodash';
import {BlobUtil} from 'utils';

export default {
  async [FETCH_WORKSHEETS_REQUEST]({commit}, {project_id}) {
    commit(FETCH_WORKSHEETS_REQUEST);
    const result = await this.$api.get('/worksheet/fetch-list', {
      project_id
    });

    if (result && result.code === 200) {
      commit(FETCH_WORKSHEETS_SUCCESS, {worksheet: result.data, project_id});
    }
    return result;
  },
  async [FETCH_WORKSHEET_FIELDS_REQUEST]({commit}, {sourceId}) {
    const result = await this.$api.get('/source/fetch-field-list', {
      source_id: sourceId
    });

    if (result && result.code === 200) {
      commit(FETCH_WORKSHEET_FIELDS_SUCCESS, {sources: result.data, id: sourceId});
    }
    return result;
  },
  async [SAVE_WORKSHEET_BASE]({commit}, {project_id, id, worksheet_name}) {
    const result = await this.$api.post('/worksheet/save-base-data', {
      id, worksheet_name
    });

    if (result && result.code === 200) {
      commit(SAVE_WORKSHEET_BASE_SUCCESS, {project_id, id, worksheet_name});
    }
    return result;
  },
  async [SAVE_WORKSHEET_DATA_REQUEST]({commit, state}, payload) {
    const {dimensions, measures, values, columns, rows, orders, filters, worksheetResultType} = state;
    const sources = _.concat(dimensions, measures);

    commit(SAVE_WORKSHEET_DATA_REQUEST);

    const result = await this.$api.post('/worksheet/save-data', Object.assign({
      sources, values, columns, rows, orders, filters, worksheetResultType
    }, payload));

    commit(SAVE_WORKSHEET_DATA_SUCCESS);

    return result;
  },
  async [OUTPUT_WORKSHEET_DATA_REQUEST]({commit, state}, payload) {
    const {values, columns, rows, orders, filters} = state;

    commit(OUTPUT_WORKSHEET_DATA_REQUEST);

    const blobData = await this.$api.post('/worksheet/output-data', Object.assign({
      values,
      columns,
      rows,
      orders,
      filters
    }, payload), {
      responseType: 'blob'
    });

    if (blobData) {
      try {
        commit(OUTPUT_WORKSHEET_DATA_SUCCESS);
        return await BlobUtil.resolveBlobData(blobData);
      } catch (error) {
        commit(OUTPUT_WORKSHEET_DATA_FAILD, {error});
        return error;
      }
    }
    return blobData;
  },
  async [FETCH_DATA_REQUEST]({commit, state}) {
    if (_.isEmpty(state.rows) && _.isEmpty(state.values)) {
      commit(FETCH_DATA_SUCCESS, {});
      return;
    }
    commit(FETCH_DATA_REQUEST);
    const result = await this.$api.post('/worksheet/fetch-result', {
      values: state.values,
      columns: state.columns,
      orders: state.orders,
      rows: state.rows,
      filters: state.filters,
      id: state.worksheetId,
      source_id: state.sourceId,
    });

    if (result && result.code === 200) {
      commit(FETCH_DATA_SUCCESS, result);
      return result;
    }
    commit(FETCH_DATA_FAILD, {error: result});
    return result;
  },
  async [FETCH_WORKSHEET_REQUEST]({commit}, {id}) {
    commit(FETCH_WORKSHEET_REQUEST);
    const result = await this.$api.get('/worksheet/fetch-data', {
      id,
    });

    if (result && result.code === 200) {
      commit(FETCH_WORKSHEET_SUCCESS, {worksheet: result.data, id});
      return result.data;
    }
  },
  async [TEST_CALC_FIELD]({state}, {value}) {
    let values = state.values;
    let columns = state.columns;
    let rows = state.rows;
    let filters = state.filters;
    const testValue = _.clone(value);

    testValue.title = 'TEST_CALC_FIELD';

    if (testValue.type === 'M') {
      values = _.map(state.values, v => v);
      values.push(testValue);
    } else if (testValue.type === 'D') {
      rows = _.map(state.rows, r => r);
      rows.push(testValue);
    }

    const result = await this.$api.post('/worksheet/fetch-result', {
      values,
      columns,
      rows,
      filters,
      id: state.worksheetId,
      source_id: state.sourceId,
      page: 1,
      size: 1
    });

    if (result && result.code === 200) {
      return result;
    }
    return void 0;
  },
};
