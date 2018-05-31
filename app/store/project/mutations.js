import {
  FETCH_PROJECTS_REQUEST,
  FETCH_PROJECTS_SUCCESS,
  FETCH_PROJECT_REQUEST,
  FETCH_PROJECT_SUCCESS,
  FETCH_SOURCES_REQUEST,
  FETCH_SOURCES_SUCCESS,
  FETCH_VIEWS_REQUEST,
  FETCH_VIEWS_SUCCESS,
} from './types';
import Vue from 'vue';
import _ from 'lodash';

export default {
  [FETCH_PROJECTS_REQUEST](state, {page, size}) {
    state.fetching = true;
    state.page = page;
    state.size = size;
  },
  [FETCH_PROJECTS_SUCCESS](state, {count, rows}) {
    state.fetching = false;
    state.projects = rows;
    state.count = count;
    _.each(rows, proj => {
      state.projectCaches[proj.id] = proj;
    });
  },
  [FETCH_PROJECT_REQUEST](state) {
    state.fetchProjecting = true;
  },
  [FETCH_PROJECT_SUCCESS](state, {project, project_id}) {
    state.fetchProjecting = false;
    Vue.set(state.projectCaches, project_id, project);
  },
  [FETCH_SOURCES_REQUEST](state) {
    state.fetchSourcesing = true;
  },
  [FETCH_SOURCES_SUCCESS](state, {source, project_id}) {
    state.fetchSourcesing = false;
    Vue.set(state.sources, project_id, source);
  },
  [FETCH_VIEWS_REQUEST](state) {
    state.fetchViewsing = true;
  },
  [FETCH_VIEWS_SUCCESS](state, {view, project_id}) {
    state.fetchViewsing = false;
    Vue.set(state.views, project_id, view);
  }
};
