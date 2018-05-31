import Vue from 'vue';
import iView from 'iview';
import Router from 'vue-router';
import pages from '../pages';
import bus from 'utils/bus';
import _ from 'lodash/core';
import {USER_LOGOUT} from 'store/user/types';
import {CLEAR_LOCAL_WORKSHEET} from 'store/worksheet/types';

Vue.use(Router);

const loadRoutes = (rous, paths, children) => {
  if (_.has(rous, 'path')) {
    let ps = _.flattenDeep(paths).filter(p => p);

    if (_.last(ps) === rous.name) {
      ps.splice(ps.length - 1, 1);
    }
    if (!children) {
      if (rous.path) {
        rous.path = '/' + ps.join('/') + (rous.path[0] === '/' ? '' : '/') + rous.path;
      } else {
        rous.path = ps.join('/') + '.html';
      }
    }
    rous.name = _.concat(ps, [rous.name]).join('.');

    if (rous.children) {
      _.each(rous.children, child => loadRoutes(child, [paths, child.name], true));
      return [rous];
    }
    return [rous];
  }
  if (rous.length) {
    return _.map(rous, r => {
      return loadRoutes(r, [paths]);
    });
  } else {
    return _.map(rous, (rou, k) => {
      return loadRoutes(rou, [paths, k]);
    });
  }
};

const routes = _.flattenDeep(loadRoutes(pages));

export function createRouter(store) {
  const router = new Router({
    mode: 'history',
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { x: 0, y: 0 };
      }
    }
  });

  router.beforeEach((to, from, next) => {
    if (!to.name) {
      return next('/error/404');
    }
    const {meta} = to;
    const {isLogin, purviews} = store.state.user || {};

    if (meta.auth !== false) {
      if (!isLogin) {
        const logRouteName = 'password.login';
        let refer = (to.name && to.name !== logRouteName) ? to.fullPath : '';

        return next({name: 'password.login', query: {refer: refer}});
      }
      if (meta.purview !== false && !_.some(purviews, p => p.id === meta.purview)) {
        iView.Message.warning('权限不足，请联系管理员');
        return next(false);
      }
    }
    next();
  });

  bus.$on('logout', ({isRefer = true} = {}) => {
    store.dispatch(USER_LOGOUT);
    store.commit(CLEAR_LOCAL_WORKSHEET);
    const route = router.currentRoute;
    const logRouteName = 'password.login';

    if (route.name === logRouteName) {
      return;
    }
    let refer;

    if (isRefer) {
      refer = (route.name && route.name !== logRouteName) ? route.path : '';
    }

    router.push({name: 'password.login', query: {refer: refer}});
  });

  return router;
}
