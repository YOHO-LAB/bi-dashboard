import * as Types from './types';

export default {
  [Types.LOGIN_USER_REQUEST](state) {
    state.isLoging = true;
  },
  [Types.LOGIN_USER_SUCCESS](state, {data}) {
    state.isLoging = false;
    state.user = data;
    state.isLogin = true;
  },
  [Types.LOGIN_USER_FAILD](state, {message}) {
    state.isLoging = false;
    state.loginError = message;
  },
  [Types.FETCH_PURVIEW_SUCCESS](state, {data}) {
    state.purviews = data;
  },
  [Types.FETCH_USERS_REQUEST](state, {page, size}) {
    state.isFetchingUsers = true;
    state.page = page;
    state.size = size;
  },
  [Types.FETCH_USERS_SUCCESS](state, {rows, count}) {
    state.isFetchingUsers = false;
    state.users = rows;
    state.count = count;
  },
  [Types.FETCH_USERS_FAILD](state, {message}) {
    state.isFetchingUsers = false;
    state.fetchUsersError = message;
  },
  [Types.CHANGE_USER_STATUS_SUCCESS](state, {user, status}) {
    user.status = status;
  },
  [Types.USER_LOGOUT]() {}
};
