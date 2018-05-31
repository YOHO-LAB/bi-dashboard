import * as Types from './types';

export default {
  async [Types.FETCH_DATABASES_REQUEST]({commit}) {
    commit(Types.FETCH_DATABASES_REQUEST);
    const result = await this.$api.get('/database/fetch-list');

    if (result && result.code === 200) {
      commit(Types.FETCH_DATABASES_SUCCESS, {sources: result.data});
    }
    return result;
  },
  async [Types.DELETE_DATABASE_REQUEST](action, {id}) {
    return await this.$api.get('/database/delete-data', {
      id
    });
  },
  async [Types.FETCH_DATABASE_REQUEST](action, {id}) {
    return await this.$api.get('/database/fetch-data', {
      id
    });
  },
  async [Types.FETCH_DATABASES_ROLE_REQUEST]() {
    return await this.$api.get('/database/fetch-databases-role');
  },
  async [Types.FETCH_SCHEMES_REQUEST](action, {databaseId}) {
    return await this.$api.get('/database/fetch-database-schemes', {databaseId});
  },
  async [Types.FETCH_TABLES_REQUEST](action, {schemeId}) {
    return await this.$api.get('/database/fetch-scheme-tables', {schemeId});
  },
  async [Types.FETCH_COLUMNS_REQUEST](action, {schemeId, tableName}) {
    return await this.$api.get('/database/fetch-table-columns', {schemeId, tableName});
  },
  async [Types.APPEND_SOURCE_TABLE]({dispatch, commit}, {schemeId, tableName}) {
    const result = await dispatch(Types.FETCH_COLUMNS_REQUEST, {schemeId, tableName});

    if (result && result.code === 200) {
      commit(Types.APPEND_SOURCE_TABLE, result);
    }
    return result;
  },
  async [Types.REMOVE_SOURCE_TABLE]({commit}, {id}) {
    commit(Types.REMOVE_SOURCE_TABLE, {id});
  },
  async [Types.FETCH_DATABASE_FILTER]() {
    return await this.$api.get('/database/fetch-database-filter');
  },
  async [Types.DELETE_DATABASE_FILTER](action, {id}) {
    return await this.$api.post('/database/delete-database-filter', {id});
  },
  async [Types.SAVE_DATABASE_FILTER](action, payload) {
    return await this.$api.post('/database/save-database-filter', payload);
  }
};
