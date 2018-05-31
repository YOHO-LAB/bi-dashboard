/**
 * app.js
 * @author: feng.chen<feng.chen@yoho.cn>
 * @date: 2017/04/13
 */
'use strict';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const compression = require('compression');
const Express = require('express');
const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');
const Logger = require('./server/utils/logger');
const config = require('./server/common/config');

const app = new Express();
const logger = new Logger(config.loggers);

Object.assign(global, {
  env: {
    version: pkg.version,
    Production: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'gray',
    Gray: process.env.NODE_ENV === 'gray',
    Test: (process.env.NODE_ENV || '').indexOf('test') >= 0
  },
  yoho: {
    logger,
    config
  }
});

try {
  app.use(cookieSession({
    name: 'yoho-bi',
    secret: 'yoho!bi!report',
    maxAge: 2 * 60 * 60 * 1000
  }));
  app.use(compression());
  app.use(Express.static(path.join(__dirname, 'dist')));
  app.use(bodyParser.json({
    limit: 1 * 1024 * 1024 // 限制请求长度1m
  }));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());

  const middleware = require('./server/middleware');
  const routers = require('./server/framework/router');

  require('./server/db');

  const tempalteFilePath = path.join(__dirname, './dist/index.html');
  let templateFile;

  if (fs.existsSync(tempalteFilePath)) {
    templateFile = fs.readFileSync(path.join(__dirname, './dist/index.html'), 'utf-8');
  }
  app.use(Express.static(path.join(__dirname, './dist')));
  app.use('/storage', Express.static(path.join(__dirname, './storage')));
  app.use('/status', (req, res) => {
    res.sendStatus(200);
  });

  // controller
  routers(app);

  // 404
  app.use('/api', middleware.errorHandler.notFound);

  app.use('*', (req, res) => {
    res.header('x-version', pkg.version);
    res.header('cache-control', 'no-store');
    res.send(templateFile || 'file not found');
  });

  // 异常捕获中间件
  app.use(middleware.errorHandler.error);
} catch (err) {
  logger.error(err && err.message);
  process.exit(1); //eslint-disable-line
}


app.listen(config.port, () => {
  logger.info(`yoho bi dashboard start at ${config.port}`);
});
