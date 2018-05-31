import mutations from './mutations';
import actions from './actions';

export default {
  state: {
    databases: [],
    fetching: false,
    sourceDistinct: false,
    sourceSql: '',
    sourceType: 'VIEW',
    viewTables: [],
    viewRelations: [],
    viewResultColumns: [],
    viewResultData: [],
    viewMode: '',
    mousePos: {x: 0, y: 0}
  },
  mutations,
  actions
};
