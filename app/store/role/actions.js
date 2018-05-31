import * as Types from './types';

export default {
  async [Types.FETCH_ROLES_COMMON_REQUEST]() {
    return await this.$api.get('/role/fetch-roles-common');
  },
  async [Types.FETCH_ROLES_REQUEST]({commit}) {
    commit(Types.FETCH_ROLES_REQUEST);

    const result = await this.$api.get('/role/fetch-roles');

    if (result && result.code) {
      commit(Types.FETCH_ROLES_SUCCESS, result);
      return result;
    }
    commit(Types.FETCH_ROLES_FAILD, result || {});
    return result;
  },
  async [Types.FETCH_ROLE_REQUEST](action, payload) {
    return await this.$api.get('/role/fetch-role', payload);
  },
  async [Types.UPDATE_ROLE_REQUEST](action, payload) {
    return await this.$api.post('/role/save-data', payload);
  },
  async [Types.DELETE_ROLE_REQUEST](action, payload) {
    return await this.$api.post('/role/delete-data', payload);
  },
  async [Types.FETCH_PURVIEWS_REQUEST](action, payload) {
    return await this.$api.get('/role/fetch-role-purviews', payload);
  },
  async [Types.UPDATE_PURVIEW_REQUEST](action, payload) {
    return await this.$api.post('/role/save-role-purviews', payload);
  }
};
