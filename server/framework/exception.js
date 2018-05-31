const logger = global.yoho.logger;

class YoHoException {
  constructor(...args) {
    this.message = args;
    this.stacks = args;
    logger.error(...args);
  }
  inspect() {
    return this.stacks;
  }
}

module.exports = YoHoException;
