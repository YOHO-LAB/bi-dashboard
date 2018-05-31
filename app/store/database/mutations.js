import _ from 'lodash';
import {Enums} from 'utils';
import * as Types from './types';

export default {
  [Types.FETCH_DATABASES_REQUEST](state) {
    state.fetching = true;
  },
  [Types.FETCH_DATABASES_SUCCESS](state, {sources}) {
    state.fetching = false;
    state.databases = sources;
  },
  [Types.RESET_DATABASE_TABLES](state) {
    state.viewTables = [];
    state.viewRelations = [];
    state.viewResultColumns = [];
    state.viewResultData = [];
    state.viewMode = '';
    state.sourceType = 'VIEW';
    state.sourceSql = '';
    state.sourceDistinct = false;
    state.mousePos = {x: 0, y: 0};
  },
  [Types.APPEND_SOURCE_TABLE](state, {data}) {
    const maxTable = _.maxBy(state.viewTables, v => v.id);
    const maxId = maxTable ? maxTable.id : 0;
    let x = 20, y = 20;

        while (_.some(state.viewTables, t => t.rect.x === x && t.rect.y === y)) { // eslint-disable-line
      x += 20;
      y += 20;
    }
    data.id = maxId + 1;
    data.rect = {
      x,
      y,
      width: 250,
      height: data.columns.length >= 7 ? 209 : (48 + data.columns.length * 23)
    };
    state.viewTables.push(data);
    _.each(state.viewTables, (t, i) => {
      t.alias = Enums.TABLE_ALIAS_DICTS[i];
    });
  },
  [Types.REMOVE_SOURCE_TABLE](state, {id}) {
    state.viewTables = _.filter(state.viewTables, v => v.id !== id);
    state.viewRelations = _.filter(state.viewRelations, v => v.from !== id && v.to !== id);
  },
  [Types.START_TABLE_MOVE](state, {id, startX, startY}) {
    const find = _.find(state.viewTables, v => v.id === id);

    state.viewMode = 'move';
    state.moveData = {
      id, startX, startY, oriX: find.rect.x, oriY: find.rect.y
    };
  },
  [Types.START_TABLE_RELATION](state, {id, canvasReact}) {
    state.viewMode = 'relation';
    state.relationData = {
      id,
      canvasReact,
    };
    state.viewRelations.push({
      from: id
    });
  },
  [Types.ADD_TABLE_RELATION](state, {from, to, join, conditions} = {}) {
    state.viewMode = '';
    let relation = _.find(state.viewRelations, r => r.from === from && !r.to);

    if (!relation) {
      relation = _.find(state.viewRelations, r => r.from === from && r.to === to);
    }

    if (relation) {
      relation.to = to;
      relation.from = from;
      relation.join = join;
      relation.conditions = conditions;
    }
    state.viewRelations = _.filter(state.viewRelations, r => r.to);
  },
  [Types.END_TABLE_RELATION](state) {
    state.viewMode = '';
    state.viewRelations = _.filter(state.viewRelations, r => r.to);
  },
  [Types.DELETE_TABLE_RELATION](state, {from, to}) {
    state.viewRelations = _.filter(state.viewRelations, r => r.from !== from || r.to !== to);
  },
  [Types.END_TABLE_MOVE](state) {
    state.viewMode = '';
    state.moveData = {};
  },
  [Types.MOVE_MOUSE_SOURCE](state, {x, y}) {
    if (state.viewMode === 'move') {
      state.mousePos = {x, y};
      const {id, startX, startY, oriX, oriY} = state.moveData;

      if (!id) {
        return;
      }
      const moveX = x - startX;
      const moveY = y - startY;
      const find = _.find(state.viewTables, v => v.id === id);

      if (find) {
        find.rect.x = oriX + moveX;
        find.rect.y = oriY + moveY;
      }
    } else if (state.viewMode === 'relation') {
      state.mousePos = {x, y};
    }
  },
  [Types.INIT_DATABASE_TABLES](state, {sourceTable, sourceType, sourceSql, sourceDistinct}) {
    if (sourceTable) {
      const {tables, columns, relations} = sourceTable;

      state.viewTables = tables;
      state.viewResultColumns = columns;
      state.viewRelations = relations;
      state.viewMode = '';
      state.sourceSql = sourceSql;
      state.sourceType = sourceType;
      state.sourceDistinct = sourceDistinct;
    }
  },
  [Types.CHANGE_VIEW_TYPE](state, {sourceType}) {
    state.sourceType = sourceType;
  },
  [Types.CHANGE_VIEW_SQL](state, {sql}) {
    state.sourceSql = sql;
  }
};
