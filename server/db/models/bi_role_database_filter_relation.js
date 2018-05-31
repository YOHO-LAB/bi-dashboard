/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiRoleDatabaseFilterRelation = sequelize.define('BiRoleDatabaseFilterRelation', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    role_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    database_filter_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_role_database_filter_relation'
  }));

  BiRoleDatabaseFilterRelation.associate = () => {
  };
  return BiRoleDatabaseFilterRelation;
};
