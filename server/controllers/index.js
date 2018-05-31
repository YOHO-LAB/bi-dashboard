/**
 * controller 入口
 * @author: feng.chen<feng.chen@yoho.cn>
 * @date: 2017/10/18
 */

'use strict';

const DatabaseController = require('./database-controller');
const SourceController = require('./source-controller');
const SourceFieldsController = require('./source-fields-controller');
const ProjectController = require('./project-controller');
const WorksheetController = require('./worksheet-controller');
const ViewsController = require('./views-controller');
const StatementController = require('./statement-controller');
const CaptchaController = require('./captcha-controller');
const UserController = require('./user-controller');
const RoleController = require('./role-controller');

module.exports = {
  DatabaseController,
  SourceController,
  SourceFieldsController,
  ProjectController,
  WorksheetController,
  ViewsController,
  StatementController,
  CaptchaController,
  UserController,
  RoleController
};
