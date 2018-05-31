import mutations from './mutations';
import actions from './actions';

export default {
  state: {
    page: 1,
    size: 10,
    count: 0,
    fetching: false,
    project: {
      page: 1,
      size: 10,
      count: 0
    },
    view: {
      page: 1,
      size: 10,
      count: 0
    }
  },
  mutations,
  actions
};
