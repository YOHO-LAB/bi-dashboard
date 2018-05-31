/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiDatabaseFilter = sequelize.define('BiDatabaseFilter', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    filter_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    database_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    database_scheme_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    table_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    field_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    filter_param_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    filter_condition: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    create_user: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    is_del: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    }
  }, Object.assign(options, {
    tableName: 'bi_database_filter'
  }));

  BiDatabaseFilter.associate = ({BiDatabases, BiDatabaseSchemes, BiRoles, BiRoleDatabaseFilterRelation}) => {
    BiDatabaseFilter.belongsTo(BiDatabases, {as: 'Database', foreignKey: 'database_id'});
    BiDatabaseFilter.belongsTo(BiDatabaseSchemes, {as: 'Scheme', foreignKey: 'database_scheme_id'});
    BiDatabaseFilter.belongsToMany(BiRoles, {as: 'Roles', through: BiRoleDatabaseFilterRelation, foreignKey: 'database_filter_id', otherKey: 'role_id'});
  };
  return BiDatabaseFilter;
};
