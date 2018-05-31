import * as Types from './types';

export default {
  [Types.FETCH_SOURCE_REQUEST](state) {
    state.fetching = true;
  },
  [Types.FETCH_SOURCE_SUCCESS](state) {
    state.fetching = false;
  },
  [Types.FETCH_SOURCE_FAILD](state) {
    state.fetching = false;
  }
};
