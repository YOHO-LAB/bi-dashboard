import mutations from './mutations';
import actions from './actions';
import getters from './getters';

export default {
  state: {
    sourceId: 0,
    worksheetId: 0,
    worksheets: {},
    fetchWorksheeting: false,
    dimensions: [],
    measures: [],
    values: [],
    columns: [],
    rows: [],
    orders: {},
    filters: [],
    fetchView: false,
    fetchDashboarding: false,
    worksheetError: '',
    viewData: {},
    viewDataSource: {},
    worksheetResultType: 'table',
    worksheetPage: 1,
    worksheetSize: 50,
    saveingWorksheet: false,
    haveNoSave: false,
    history: {
      baseIndex: 0,
      currentIndex: 0,
      historyLength: 0,
      startIndex: 0
    }
  },
  getters,
  mutations,
  actions
};
