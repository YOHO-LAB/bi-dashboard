/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiDatabases = sequelize.define('BiDatabases', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    db_host: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    db_port: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    db_user: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    db_password: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    db_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    db_version: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    create_user: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    is_del: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    create_role: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    }
  }, Object.assign(options, {
    tableName: 'bi_databases'
  }));

  BiDatabases.associate = ({BiDatabaseSchemes}) => {
    BiDatabases.hasMany(BiDatabaseSchemes, {as: 'Schemes', foreignKey: 'database_id'});
  };

  return BiDatabases;
};
