/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiDatabaseSchemes = sequelize.define('BiDatabaseSchemes', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    database_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    scheme_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
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
    tableName: 'bi_database_schemes'
  }));

  BiDatabaseSchemes.associate = ({BiDatabases, BiDatabaseSchemeRoles}) => {
    BiDatabaseSchemes.belongsTo(BiDatabases, {as: 'Database', foreignKey: 'database_id'});
    BiDatabaseSchemes.hasMany(BiDatabaseSchemeRoles, {as: 'Roles', foreignKey: 'database_scheme_id'});
  };

  return BiDatabaseSchemes;
};
