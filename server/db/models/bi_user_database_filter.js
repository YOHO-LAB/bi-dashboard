/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiUserDatabaseFilter = sequelize.define('BiUserDatabaseFilter', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    database_filter_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    filter_value: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_user_database_filter'
  }));

  BiUserDatabaseFilter.associate = ({BiUsers, BiDatabaseFilter}) => {
    BiUserDatabaseFilter.belongsTo(BiUsers, {as: 'User', foreignKey: 'user_id'});
    BiUserDatabaseFilter.belongsTo(BiDatabaseFilter, {as: 'Filter', foreignKey: 'database_filter_id'});
  };
  return BiUserDatabaseFilter;
};
