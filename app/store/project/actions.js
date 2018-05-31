import {
  FETCH_PROJECTS_REQUEST,
  FETCH_PROJECTS_SUCCESS,
  FETCH_PROJECT_REQUEST,
  FETCH_PROJECT_SUCCESS,
  FETCH_SOURCES_REQUEST,
  FETCH_SOURCES_SUCCESS,
  FETCH_VIEWS_REQUEST,
  FETCH_VIEWS_SUCCESS,
  LOAD_PROHECT_INFO,
} from './types';

export default {
  async [FETCH_PROJECTS_REQUEST]({commit, state}, {page, size}) {
    page = page || state.page;
    size = size || state.size;
    commit(FETCH_PROJECTS_REQUEST, {page, size});
    const result = await this.$api.get('/project/fetch-list', {page, size});

    if (result && result.code === 200) {
      commit(FETCH_PROJECTS_SUCCESS, result.data);
    }
    return result;
  },
  async [FETCH_PROJECT_REQUEST]({commit}, {project_id}) {
    commit(FETCH_PROJECT_REQUEST);
    const result = await this.$api.get('/project/fetch-data', {id: project_id});

    if (result && result.code === 200) {
      commit(FETCH_PROJECT_SUCCESS, {project: result.data, project_id});
    }
    return result;
  },
  async [LOAD_PROHECT_INFO]({state, dispatch}, {project_id}) {
    if (!state.projectCaches[project_id]) {
      await dispatch(FETCH_PROJECT_REQUEST, {project_id});
    }
  },
  async [FETCH_SOURCES_REQUEST]({commit, state, dispatch}, {project_id}) {
    commit(FETCH_SOURCES_REQUEST);
    const result = await this.$api.get('/source/fetch-list', {
      project_id
    });

    if (result && result.code === 200) {
      commit(FETCH_SOURCES_SUCCESS, {source: result.data, project_id});
      if (!state.projectCaches[project_id]) {
        dispatch(FETCH_PROJECT_REQUEST, {project_id});
      }
    }
  },
  async [FETCH_VIEWS_REQUEST]({commit, state, dispatch}, {project_id}) {

    commit(FETCH_VIEWS_REQUEST);
    const result = await this.$api.get('/view/fetch-list', {
      project_id
    });

    if (result && result.code === 200) {
      commit(FETCH_VIEWS_SUCCESS, {view: result.data, project_id});

      if (!state.projectCaches[project_id]) {
        dispatch(FETCH_PROJECT_REQUEST, {project_id});
      }
    }
  }
};
