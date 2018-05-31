/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiRolePurviews = sequelize.define('BiRolePurviews', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    role_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    purview_id: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_role_purviews'
  }));

  BiRolePurviews.associate = () => {
  };
  return BiRolePurviews;
};
