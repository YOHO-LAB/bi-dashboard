/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiRoles = sequelize.define('BiRoles', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    shops_id: {
      type: DataTypes.INTEGER(11),
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
    tableName: 'bi_roles'
  }));

  BiRoles.associate = ({BiUsers, BiPurviews, BiRolePurviews, BiDatabaseFilter, BiRoleDatabaseFilterRelation}) => {
    BiRoles.hasMany(BiUsers, {as: 'Users', foreignKey: 'role_id'});
    BiRoles.belongsToMany(BiPurviews, {as: 'Purviews', through: BiRolePurviews, foreignKey: 'role_id', otherKey: 'purview_id'});
    BiRoles.belongsToMany(BiDatabaseFilter, {as: 'DatabaseFilters', through: BiRoleDatabaseFilterRelation, foreignKey: 'role_id', otherKey: 'database_filter_id'});
  };
  return BiRoles;
};
