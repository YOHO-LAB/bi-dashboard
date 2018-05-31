/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiUsers = sequelize.define('BiUsers', {
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
    user_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    user_pwd: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    real_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    create_user: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    is_del: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_users'
  }));

  BiUsers.associate = ({BiRoles, BiUserDatabaseFilter}) => {
    BiUsers.belongsTo(BiRoles, {as: 'Role', foreignKey: 'role_id'});
    BiUsers.hasMany(BiUserDatabaseFilter, {as: 'DatbaseFilters', foreignKey: 'user_id'});
  };
  return BiUsers;
};
