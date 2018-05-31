const _ = require('lodash');
const controllers = require('../controllers');
const YohoException = require('./exception');
const mdAuth = require('../middleware/auth');
const {injectCreate} = require('./inject');
const express = require('express');
const router = express.Router(); // eslint-disable-line

const REG_CTRL = /(\w+)(?:Controller)/;
const REG_PATH = /(?:[A-Z])[a-z]*/g;

const getControllerName = Controller => {
  const matchs = REG_CTRL.exec(Controller.name);

  if (!matchs || !matchs[1]) {
    throw new YohoException(`controller name "${Controller.name}" is incorrect`);
  }
  return matchs[1];
};

const getControllerPath = route => {
  let pathMatchs;
  let paths = [];

  while ((pathMatchs = REG_PATH.exec(route.name)) !== null) {
    paths.push(pathMatchs[0]);
  }
  return `/${_.join(_.map(paths, p => _.lowerCase(p)), '-')}${route.path}`;
};

const resolveRouter = (ctrls) => {
  const routers = _.map(ctrls, Controller => {
    if (!Controller.route) {
      throw new YohoException(`controller "${Controller.name}" route function is not found`);
    }
    const ctrlName = getControllerName(Controller);
    const routes = Controller.route();

    return _.map(routes, route => {
      const befores = _.get(route, 'befores', []);
      const afters = _.get(route, 'afters', []);

      return {
        path: route.path,
        alias: route.alias,
        action: route.action,
        method: route.method,
        auth: route.auth,
        befores,
        afters,
        purview: route.purview,
        controller: Controller,
        name: ctrlName
      };
    });
  });

  return _.flatten(routers);
};

const actionSelecter = ({controller: Controller, action, purview, auth}) => {
  return async(req, res, next) => {
    try {
      const ctx = {req, res};
      const user = req.user;
      const ctrl = injectCreate(Controller, {$ctx: ctx, $user: user});

      if (!ctrl[action]) {
        return next(new YohoException(`controller '${Controller.name}' action:${action} is not found`));
      }
      if (auth !== false) {
        const purviews = _.get(req, 'user.purviews');

        if (!purviews) {
          return res.status(401).json({
            code: 401,
            message: '请登录后继续操作'
          });
        }
        if (purview && !_.some(purviews, p => p.id === purview)) {
          return res.status(401).json({
            code: 999,
            message: '权限不足，如账号权限发生改变，重新登录后生效'
          });
        }
      }
      return await ctrl[action](req, res, next);
    } catch (error) {
      return next(error);
    }
  };
};


module.exports = (app) => {
  const routes = resolveRouter(controllers);

  _.each(routes, route => {
    const method = route.method || 'get';

    if (!router[method]) {
      throw new YohoException(`route '${route.path}' method:${method} is incorrect`);
    }
    let middleware = [];

    if (route.auth !== false) {
      middleware.push(mdAuth);
    }
    if (route.befores.length) {
      middleware = middleware.concat(route.befores);
    }
    middleware.push(actionSelecter(route));
    if (route.afters.length) {
      middleware = middleware.concat(route.afters);
    }

    router[method](route.alias || getControllerPath(route), ...middleware);
  });

  app.use('/api', router);
};
