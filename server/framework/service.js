const Model = require('sequelize/lib/model');
const YohoException = require('../framework/exception');

class Service {
  constructor(model) {
    if (!model) {
      throw new YohoException('Service Model not found');
    }
    if (Object.getPrototypeOf(model) !== Model) {
      throw new YohoException('Service Model is not Sequelize Model');
    }
    this.$model = model;
  }
  async query(options) {
    return await this.$model.findAll(options);
  }
  async gets(where) {
    return await this.$model.findAll({where});
  }
  async get(id) {
    return await this.$model.findById(id);
  }
  async create(model) {
    return await this.$model.create(model);
  }
  async save(model) {
    return await model.save();
  }
  async delete(model) {
    return await model.destroy();
  }
}


module.exports = Service;
