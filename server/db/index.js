const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../common/database.json')[env];
const logger = global.yoho.logger;
const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, Object.assign(config, {
  logging: (log) => {
    logger.info(log);
  }
}));

fs
  .readdirSync(path.join(__dirname, './models'))
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    let model = sequelize.import(path.join(__dirname, './models', file));

    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
