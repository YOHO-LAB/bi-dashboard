/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectViewsWorksheet = sequelize.define('BiProjectViewsWorksheet', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    view_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    worksheet_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    view_order: {
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
    tableName: 'bi_project_views_worksheet'
  }));

  BiProjectViewsWorksheet.associate = ({BiProjectViews, BiProjectWorksheets}) => {
    BiProjectViewsWorksheet.belongsTo(BiProjectViews, {as: 'ProjectView', foreignKey: 'worksheet_id'});
    BiProjectViewsWorksheet.belongsTo(BiProjectWorksheets, {as: 'Worksheet', foreignKey: 'worksheet_id'});
  };
  return BiProjectViewsWorksheet;
};
