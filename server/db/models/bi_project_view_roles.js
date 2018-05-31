/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectViewRoles = sequelize.define('BiProjectViewRoles', {
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
    role_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_project_view_roles'
  }));

  BiProjectViewRoles.associate = ({BiProjectViews}) => {
    BiProjectViewRoles.belongsTo(BiProjectViews, {as: 'ProjectView', foreignKey: 'view_id'});
  };
  return BiProjectViewRoles;
};
