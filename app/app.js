import Vue from 'vue';
import App from './app.vue';
import iView from 'iview';
import './filters';
import {createStore} from './store';
import {createRouter} from './router';
import pluginCore from './plugins/core';

import 'iview/dist/styles/iview.css';

const store = createStore();
const router = createRouter(store);

Vue.use(iView);
Vue.use(pluginCore);

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
