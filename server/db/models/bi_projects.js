/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjects = sequelize.define('BiProjects', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    project_intro: {
      type: DataTypes.STRING(500),
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
    is_public: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    },
    create_role: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    }
  }, Object.assign(options, {
    tableName: 'bi_projects'
  }));

  BiProjects.associate = ({BiProjectWorksheets, BiProjectSources, BiProjectViews}) => {
    BiProjects.hasMany(BiProjectWorksheets, {as: 'ProjectWorksheets', foreignKey: 'project_id'});
    BiProjects.hasMany(BiProjectSources, {as: 'ProjectSources', foreignKey: 'project_id'});
    BiProjects.hasMany(BiProjectViews, {as: 'ProjectViews', foreignKey: 'project_id'});
  };
  return BiProjects;
};
