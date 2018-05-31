import mutations from './mutations';
import actions from './actions';

export default {
  state: {
    isFetchingRoles: false,
    roles: [],
    fetchRolesError: ''
  },
  mutations,
  actions
};
