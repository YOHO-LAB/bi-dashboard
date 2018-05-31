/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectSourceTables = sequelize.define('BiProjectSourceTables', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    source_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    scheme_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    table_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    alias_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_project_source_tables'
  }));

  BiProjectSourceTables.associate = ({BiProjectSources}) => {
    BiProjectSourceTables.belongsTo(BiProjectSources, {as: 'ProjectSource', foreignKey: 'source_id'});
  };
  return BiProjectSourceTables;
};
