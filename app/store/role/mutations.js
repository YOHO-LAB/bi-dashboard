import * as Types from './types';

export default {
  [Types.FETCH_ROLES_REQUEST](state) {
    state.isFetchingRoles = true;
  },
  [Types.FETCH_ROLES_SUCCESS](state, {data}) {
    state.isFetchingRoles = false;
    state.roles = data;
  },
  [Types.FETCH_ROLES_FAILD](state, {message}) {
    state.isFetchingRoles = false;
    state.fetchRolesError = message;
  },
};
