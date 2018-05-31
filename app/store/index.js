import Vue from 'vue';
import Vuex from 'vuex';
import createApi from 'create-api';
import HistoryPlugin from './history-plugin';
import BiPlugin from './bi-plugin';

import worksheet from './worksheet';
import database from './database';
import project from './project';
import source from './source';
import view from './view';
import bi from './bi';
import user from './user';
import role from './role';
import statement from './statement';

Vue.use(Vuex);

export function createStore() {
  const store = new Vuex.Store({
    modules: {
      worksheet,
      database,
      project,
      view,
      source,
      bi,
      user,
      role,
      statement
    },
    plugins: [HistoryPlugin, BiPlugin],
    strict: process.env.NODE_ENV !== 'production'
  });

  store.$api = createApi;

  return store;
}
