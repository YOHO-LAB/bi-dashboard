/**
 * config.js
 * @author: feng.chen<feng.chen@yoho.cn>
 * @date: 2017/10/18
 */

const isProduction = process.env.NODE_ENV === 'production';
const commonConfig = require('../../config');

'use strict';
const config = {
  app: 'yoho-bi',
  port: 8887,
  ldap: {
    url: '',
    dcs: ['company', 'local']
  },
  geetest: {
    id: '',
    key: ''
  },
  loggers: {
    file: {
      name: 'file',
      level: 'info',
      filename: '/Data/logs/yoho-bi-dashboard/info/info.log',
      maxFiles: 1,
      tailable: true,
      maxsize: Math.pow(1024, 3),
      timestamp() {
        return new Date().toString();
      }
    },
    error: {
      name: 'error',
      level: 'error',
      filename: '/Data/logs/yoho-bi-dashboard/error/error.log',
      handleExceptions: true,
      maxFiles: 1,
      tailable: true,
      maxsize: Math.pow(1024, 3),
      timestamp() {
        return new Date().toString();
      }
    },
    console: {
      level: 'info',
      colorize: 'all',
      prettyPrint: false
    }
  },
};

if (isProduction) {
  Object.assign(config, {
    ldap: {
      url: '',
      dcs: ['company', 'local']
    },
  });
}

module.exports = Object.assign(commonConfig, config);
