import mutations from './mutations';
import actions from './actions';

export default {
  state: {
    isLoging: false,
    loginError: '',
    isLogin: false,
    user: {},
    purviews: [],
    isFetchingUsers: false,
    users: [],
    fetchUsersError: '',
    page: 1,
    size: 10,
    count: 0
  },
  mutations,
  actions
};
