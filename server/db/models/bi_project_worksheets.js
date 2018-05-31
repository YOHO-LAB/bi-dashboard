/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectWorksheets = sequelize.define('BiProjectWorksheets', {
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
    source_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    worksheet_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    worksheet_data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    worksheet_purview: {
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
    }
  }, Object.assign(options, {
    tableName: 'bi_project_worksheets'
  }));

  BiProjectWorksheets.associate = ({BiProjects, BiProjectSources, BiProjectViewsWorksheet}) => {
    BiProjectWorksheets.belongsTo(BiProjects, {as: 'Project', foreignKey: 'project_id'});
    BiProjectWorksheets.belongsTo(BiProjectSources, {as: 'ProjectSource', foreignKey: 'source_id'});
    BiProjectWorksheets.hasMany(BiProjectViewsWorksheet, {as: 'ViewsWorksheet', foreignKey: 'worksheet_id'});
  };
  return BiProjectWorksheets;
};
