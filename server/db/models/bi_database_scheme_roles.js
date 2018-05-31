/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiDatabaseSchemeRoles = sequelize.define('BiDatabaseSchemeRoles', {
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
    database_scheme_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_database_scheme_roles'
  }));

  BiDatabaseSchemeRoles.associate = ({BiDatabaseSchemes}) => {
    BiDatabaseSchemeRoles.belongsTo(BiDatabaseSchemes, {as: 'Scheme', foreignKey: 'database_scheme_id'});
  };
  return BiDatabaseSchemeRoles;
};
