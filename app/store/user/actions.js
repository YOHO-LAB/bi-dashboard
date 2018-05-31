import * as Types from './types';


export default {
  async [Types.LOGIN_USER_REQUEST]({commit}, {userName, password, captcha}) {
    commit(Types.LOGIN_USER_REQUEST);
    const result = await this.$api.post('/user/login', {userName, password, captcha});

    if (result && result.code === 200) {
      const purResult = await this.$api.get('/user/fetch-purview');

      if (purResult && purResult.code === 200) {
        commit(Types.FETCH_PURVIEW_SUCCESS, purResult);
        commit(Types.LOGIN_USER_SUCCESS, result);
        return result;
      }
    }
    commit(Types.LOGIN_USER_FAILD, result || {});
    return result;
  },
  async [Types.FETCH_USERS_REQUEST]({commit, state}, {page, size}) {
    page = page || state.page;
    size = size || state.size;
    commit(Types.FETCH_USERS_REQUEST, {page, size});

    const result = await this.$api.get('/user/fetch-users', {page, size});

    if (result && result.code === 200) {
      commit(Types.FETCH_USERS_SUCCESS, result.data);
      return result;
    }
    commit(Types.FETCH_USERS_FAILD, result || {});
    return result;
  },
  async [Types.FETCH_USER_REQUEST]({commit}, {id}) {
    const result = await this.$api.get('/user/fetch-user', {id});

    if (result && result.code === 200) {
      return result;
    }
    commit(Types.FETCH_USER_FAILD, result || {});
    return result;
  },
  async [Types.CHANGE_USER_STATUS]({commit}, {user, status}) {
    const result = await this.$api.post('/user/change-status', {uid: user.id, status});

    if (result && result.code === 200) {
      commit(Types.CHANGE_USER_STATUS_SUCCESS, {user, status});
    }
    return result;
  },
  async [Types.UPDATE_USER_REQUEST](action, payload) {
    return await this.$api.post('/user/save-data', payload);
  },
  async [Types.USER_LOGOUT]({commit}) {
    await this.$api.post('/user/logout');
    commit(Types.USER_LOGOUT);
  },
};
