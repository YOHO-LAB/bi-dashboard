import _ from 'lodash';
import * as Types from './worksheet/types';

const historyTypes = [Types.ACCPET_VALUE, Types.REMOVE_VALUE, Types.SORT_CHANGE, Types.FILTER_CHANGE, Types.RENAME_VALUE, Types.CHANGE_VALUE_OPTION, Types.ADD_CATEGORY_FIELD, Types.ADD_CALC_FIELD, Types.REMOVE_SOURCE_FIELD, Types.CHANGE_CATEGORY_ORDER, Types.EXPAND_CATEGORY, Types.BACK_CATEGORY, Types.DRAG_VALUE_ACCPET, Types.DRAG_VALUE_REMOVE, Types.DRAG_VALUE_HOVER];
const historyMaxLength = 20;

const getState = (index) => {
  const state = localStorage.getItem(`state_${index}`);

  if (state) {
    return JSON.parse(state);
  }
  return void 0;
};
const setState = (state, index) => {
  const workSheet = {
    dimensions: state.dimensions,
    measures: state.measures,
    values: state.values,
    columns: state.columns,
    rows: state.rows,
    orders: state.orders,
    filters: state.filters,
  };

  localStorage.setItem(`state_${index}`, JSON.stringify(workSheet));
};
const delState = (index) => {
  localStorage.removeItem(`state_${index}`);
};
const removeHistroy = (currentIndex, removeLength) => {
  for (let index = 0; index < removeLength; index++) {
    delState(currentIndex + index);
  }
};
const recordIndex = ({baseIndex, currentIndex, historyLength, startIndex}) => {
  localStorage.setItem('state_index', JSON.stringify({baseIndex, currentIndex, historyLength, startIndex}));
};
const getRecordIndex = () => {
  const record = localStorage.getItem('state_index');

  if (record) {
    return JSON.parse(record);
  }
  const history = {
    baseIndex: 0,
    currentIndex: 0,
    historyLength: 0,
    startIndex: 0
  };

  localStorage.setItem('state_index', JSON.stringify(history));
  return history;
};
const addHistroy = (state) => {
  let {baseIndex, currentIndex, historyLength, startIndex} = getRecordIndex();

  if (historyLength) {
    currentIndex++;
  }

  setState(state, currentIndex);

  if (historyLength > currentIndex) {
    removeHistroy(currentIndex + 1, historyLength - currentIndex - 1);
  }
  historyLength = currentIndex + 1;
  if (historyLength > historyMaxLength) {
    removeHistroy(startIndex, historyLength - startIndex - historyMaxLength);
    startIndex = historyLength - historyMaxLength;
  }
  recordIndex({baseIndex, currentIndex, historyLength, startIndex});
  return {baseIndex, currentIndex, historyLength, startIndex};
};

const moveHistory = (goBack) => {
  let {baseIndex, currentIndex, historyLength, startIndex} = getRecordIndex();

  if (goBack) {
    if (currentIndex > startIndex) {
      currentIndex--;
    }
  } else {
    if (currentIndex < historyLength - 1) {
      currentIndex++;
    }
  }
  const stateData = getState(currentIndex);

  if (stateData) {
    recordIndex({baseIndex, currentIndex, historyLength, startIndex});

    return {stateData, history: {baseIndex, currentIndex, historyLength, startIndex}};
  }
  return {};
};


export default store => {
  let reloadHistory = getRecordIndex();

  store.commit(Types.UPDATE_HISTORY, reloadHistory);
  store.subscribe((mutation, state) => {
    if (_.some(historyTypes, t => t === mutation.type)) {
      const history = addHistroy(state.worksheet);

      store.commit(Types.UPDATE_HISTORY, history);
    } else if (mutation.type === Types.FETCH_WORKSHEET_SUCCESS ||
            mutation.type === Types.FETCH_WORKSHEET_FIELDS_SUCCESS) {
      let history = getRecordIndex();

      if (!history.historyLength) {
        setState(state.worksheet, history.baseIndex);
        history.historyLength += 1;
        recordIndex(history);
        store.commit(Types.UPDATE_HISTORY, history);
      }
    } else if (mutation.type === Types.HISTORY_REVERT) {
      let history = getRecordIndex();

      if (history.baseIndex >= history.startIndex) {
        history.currentIndex = history.baseIndex;
        const stateData = getState(history.baseIndex);

        recordIndex(history);
        store.commit(Types.UPDATE_HISTORY, history);
        store.commit(Types.HISTORY_UPDATE_WORKSHEET, stateData);
      }
    } else if (mutation.type === Types.HISTORY_BACK) {
      const {stateData, history} = moveHistory(true);

      if (stateData) {
        store.commit(Types.UPDATE_HISTORY, history);
        store.commit(Types.HISTORY_UPDATE_WORKSHEET, stateData);
      }
    } else if (mutation.type === Types.HISTORY_FORWORD) {
      const {stateData, history} = moveHistory(false);

      if (stateData) {
        store.commit(Types.UPDATE_HISTORY, history);
        store.commit(Types.HISTORY_UPDATE_WORKSHEET, stateData);
      }
    } else if (mutation.type === Types.SAVE_WORKSHEET_DATA_SUCCESS) {
      let history = getRecordIndex();

      history.baseIndex = history.currentIndex;
      recordIndex(history);
      store.commit(Types.UPDATE_HISTORY, history);
    } else if (mutation.type === Types.LOAD_LOCAL_WORKSHEET) {
      let {currentIndex} = getRecordIndex();
      const stateData = getState(currentIndex);

      store.commit(Types.HISTORY_UPDATE_WORKSHEET, stateData);
    } else if (mutation.type === Types.CLEAR_LOCAL_WORKSHEET) {
      let {startIndex, historyLength} = getRecordIndex();

      removeHistroy(startIndex, historyLength - startIndex);
      localStorage.removeItem('state_index');
      store.commit(Types.UPDATE_HISTORY, {
        baseIndex: 0, currentIndex: 0, historyLength: 0, startIndex: 0
      });
    }
  });
};
