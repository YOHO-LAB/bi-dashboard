import mutations from './mutations';
import actions from './actions';

export default {
  state: {
    dragStatus: '',
    dragId: '',
    dragValue: void 0,
    dragOverValue: void 0,
    dragHoverValue: void 0,
    dragingValue: {},
  },
  mutations,
  actions,
};
