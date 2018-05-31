const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const {createLogger, format, transports} = require('winston');
const { combine, simple, splat, timestamp } = format;

class Logger {
  constructor(loggers) {
    this.init(loggers);
  }
  init(loggers) {
    try {
      let tps;
      let mkdirSync = (dirname) => {
        if (fs.existsSync(dirname)) {
          return true;
        } else {
          if (mkdirSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
          }
        }
      };

      _.each(loggers, logger => {
        if (logger.filename) {
          mkdirSync(path.dirname(logger.filename));
        }
      });

      tps = [new transports.Console(loggers.console)];

      if (!loggers.file.close) {
        tps.push(new transports.File(loggers.file));
      }
      this.defaultLogger = createLogger({
        format: combine(
          splat(),
          simple(),
          timestamp()
        ),

        transports: tps,
        exitOnError: false
      });
    } catch (e) {
      console.error(e);
    }
    return this;
  }

  // 动态改变日志级别
  changeLevel(level, name) {
    name = name || 'console';
    let transport = this.defaultLogger.transports[name];

    if (transport) {
      transport.level = level;
      return true;
    } else {
      return false;
    }
  }
  get logger() {
    return this.defaultLogger;
  }
  log(...args) {
    this.defaultLogger.log.apply(this.defaultLogger, ...args);
  }
  debug() {
    this.defaultLogger.debug.apply(this.defaultLogger, arguments);
  }
  info(...args) {
    this.defaultLogger.info.apply(this.defaultLogger, args);
  }
  warn() {
    this.defaultLogger.warn.apply(this.defaultLogger, arguments);
  }
  error() {
    this.defaultLogger.error.apply(this.defaultLogger, arguments);
  }
}

module.exports = Logger;
