/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectSources = sequelize.define('BiProjectSources', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    source_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    source_table: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    database_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
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
    source_sql: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    source_type: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    source_distinct: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    }
  }, Object.assign(options, {
    tableName: 'bi_project_sources'
  }));

  BiProjectSources.associate = ({BiProjects, BiDatabases, BiProjectSourceFields, BiProjectSourceTableRelations, BiProjectSourceTables}) => {
    BiProjectSources.belongsTo(BiProjects, {as: 'Project', foreignKey: 'project_id'});
    BiProjectSources.belongsTo(BiDatabases, {as: 'Database', foreignKey: 'database_id'});
    BiProjectSources.hasMany(BiProjectSourceFields, {as: 'Columns', foreignKey: 'source_id'});
    BiProjectSources.hasMany(BiProjectSourceTableRelations, {as: 'Relations', foreignKey: 'source_id'});
    BiProjectSources.hasMany(BiProjectSourceTables, {as: 'Tables', foreignKey: 'source_id'});
  };
  return BiProjectSources;
};
