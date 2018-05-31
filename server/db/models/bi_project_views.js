/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectViews = sequelize.define('BiProjectViews', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    view_name: {
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
    tableName: 'bi_project_views'
  }));

  BiProjectViews.associate = ({BiProjects, BiProjectViewsWorksheet, BiProjectViewRoles}) => {
    BiProjectViews.belongsTo(BiProjects, {as: 'Project', foreignKey: 'project_id'});
    BiProjectViews.hasMany(BiProjectViewsWorksheet, {as: 'ViewWorksheets', foreignKey: 'worksheet_id'});
    BiProjectViews.hasMany(BiProjectViewRoles, {as: 'Roles', foreignKey: 'view_id'});
  };

  return BiProjectViews;
};
