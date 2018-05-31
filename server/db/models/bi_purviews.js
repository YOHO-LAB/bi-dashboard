/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiPurviews = sequelize.define('BiPurviews', {
    id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    purview_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    purview_level: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    purview_parent: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    create_user: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    is_del: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    }
  }, Object.assign(options, {
    tableName: 'bi_purviews'
  }));

  BiPurviews.associate = () => {
  };
  return BiPurviews;
};
