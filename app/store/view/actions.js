import {
  VIEW_FETCH_REQUEST,
  VIEW_FETCH_SUCCESS,
  VIEW_WORKSHEETS_FETCH_REQUEST,
  VIEW_WORKSHEETS_FETCH_SUCCESS,
  VIEW_DASHBOARDS_REQUEST,
  FETCH_DASHBOARDS_DETAIL,
  FILL_DASHBOARDS_DETAIL,
  VIEW_WORKSHEET_RESULT_SUCCESS,
  OUTPUT_VIEW_DATA_REQUEST,
  OUTPUT_VIEW_DATA_SUCCESS,
  OUTPUT_VIEW_DATA_FAILD,
  SAVE_DASHBOARDS_REQUEST
} from './types';
import _ from 'lodash';
import {BlobUtil} from 'utils';

export default {
  async [VIEW_FETCH_REQUEST]({commit}, {id}) {
    const result = await this.$api.get('/view/fetch-data', {
      id
    });

    if (result) {
      commit(VIEW_FETCH_SUCCESS, {data: result.data});

      return result.data;
    }
  },
  async [VIEW_WORKSHEETS_FETCH_REQUEST]({commit}, {project_id}) {
    commit(VIEW_WORKSHEETS_FETCH_REQUEST);

    const result = await this.$api.get('/view/fetch-worksheets', {
      project_id
    });

    if (result && result.code === 200) {
      commit(VIEW_WORKSHEETS_FETCH_SUCCESS, {worksheets: result.data});
    }
  },
  async [VIEW_DASHBOARDS_REQUEST]({commit}, {view_id}) {
    commit(VIEW_DASHBOARDS_REQUEST);
    const result = await this.$api.post('/view/fetch-dashboards', {view_id});

    if (result && result.code === 200) {
      commit(VIEW_WORKSHEET_RESULT_SUCCESS, result);
    }
    return result;
  },
  async [FETCH_DASHBOARDS_DETAIL]({commit}, {filters, worksheetId, project_id}) {
    const result = await this.$api.post('/view/fetch-dashboard-detail', {
      filters, worksheetId, project_id
    });

    if (result && result.code === 200) {
      commit(FILL_DASHBOARDS_DETAIL, result.data);
    }
    return result;
  },
  async [OUTPUT_VIEW_DATA_REQUEST]({commit}, payload) {
    commit(OUTPUT_VIEW_DATA_REQUEST);

    const blobData = await this.$api.post('/view/fetch-publish-output', payload, {
      responseType: 'blob'
    });

    if (blobData) {
      try {
        commit(OUTPUT_VIEW_DATA_SUCCESS);
        return await BlobUtil.resolveBlobData(blobData);
      } catch (error) {
        commit(OUTPUT_VIEW_DATA_FAILD, {error});
        return error;
      }
    }
    return blobData;
  },
  async [SAVE_DASHBOARDS_REQUEST]({state}, {id, view_name, project_id}) {
    return await this.$api.post('/view/save-data', {
      viewData: {
        view_name,
        project_id
      },
      id,
      worksheetResults: _.map(state.dashboards, wr => {
        return {
          worksheet_id: wr.worksheet_id,
        };
      })
    });
  }
};
