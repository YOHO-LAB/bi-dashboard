/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectSourceFields = sequelize.define('BiProjectSourceFields', {
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
    table_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    table_scheme_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    table_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    table_alias_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    field_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    field_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: ''
    },
    field_ori_type: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    field_alias: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    is_del: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    }
  }, Object.assign(options, {
    tableName: 'bi_project_source_fields'
  }));

  BiProjectSourceFields.associate = ({BiProjectSources}) => {
    BiProjectSourceFields.belongsTo(BiProjectSources, {as: 'ProjectSource', foreignKey: 'source_id'});
  };
  return BiProjectSourceFields;
};
