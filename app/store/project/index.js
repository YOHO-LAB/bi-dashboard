import mutations from './mutations';
import actions from './actions';
import getters from './getters';

export default {
  state: {
    projects: [],
    page: 1,
    size: 11,
    count: 0,
    fetching: false,
    projectCaches: {},
    fetchProjecting: false,
    fetchSourcesing: false,
    sources: {},
    fetchViewsing: false,
    views: {},
  },
  mutations,
  actions,
  getters
};
