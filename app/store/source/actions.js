import * as Types from './types';
import * as DatabaseTypes from '../database/types';


export default {
  async [Types.FETCH_SOURCE_REQUEST]({commit}, {id}) {
    commit(Types.FETCH_SOURCE_REQUEST);
    commit(DatabaseTypes.RESET_DATABASE_TABLES);

    const result = await this.$api.get('/source/fetch-data', {
      id,
    });

    if (result && result.code === 200) {
      commit(Types.FETCH_SOURCE_SUCCESS);
      commit(DatabaseTypes.INIT_DATABASE_TABLES, result.data);
    } else {
      commit(Types.FETCH_SOURCE_FAILD);
    }
    return result;
  },
  async [Types.FETCH_SOURCE_DATA_PURVIEW](action, {database_id, tables, relations, sql, source_type, distinct}) {
    return this.$api.post('/source/fetch-purview-data', {
      database_id, tables, relations, sql, source_type, distinct
    });
  },
  async [Types.SAVE_SOURCE_REQUEST](action, payload) {
    const result = await this.$api.post('/source/save-data', payload);

    if (result && result.code === 200) {
      return result;
    }
  }
};
