import * as Types from './types';

export default {
  [Types.DRAGING_ITEM](state, data) {
    state.dragingValue = data;
  },
  [Types.DROP_ITEM](state, {targetType, order}) {
    state.dragingValue.targetType = targetType;
    state.dragingValue.order = order;
  },
  [Types.DRAGEND_ITEM](state) {
    state.dragingValue = {};
  },
  [Types.MOUSEDOWN_DRAG_ITEM](state, {id, value, el}) {
    state.dragStatus === 'mousedown';
    state.dragId = id;
    state.dragValue = value;
    state.dragEl = el;
  },
  [Types.START_DRAGING_ITEM](state) {
    state.dragStatus === 'draging';
    state.dragingValue = {
      value: state.dragValue,
      fromType: state.dragId
    };
  },
  [Types.END_DRAGING_ITEM](state) {
    state.dragStatus === '';
    state.dragId = 0;
    state.dragValue = void 0;
    state.dragEl = void 0;
  },
  [Types.SET_DRAG_STATUS](state, {status}) {
    if (!status) {
      state.dragOverValue = void 0;
    }
    state.dragStatus = status;
  },
  [Types.SET_DRAGOVER_VALUE](state, {value}) {
    if (state.dragStatus === 'draging') {
      state.dragOverValue = value;
    }
  },
  [Types.SET_DRAGHOVER_VALUE](state, {value}) {
    if (state.dragStatus === 'draging') {
      state.dragHoverValue = value;
    }
  }
};
