/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectSourceTableRelationConditions = sequelize.define('BiProjectSourceTableRelationConditions', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    relation_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    main_field: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    belong_field: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    relation_condition: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_project_source_table_relation_conditions'
  }));

  BiProjectSourceTableRelationConditions.associate = ({BiProjectSourceTableRelations}) => {
    BiProjectSourceTableRelationConditions.belongsTo(BiProjectSourceTableRelations, {as: 'Relation', foreignKey: 'relation_id'});
  };

  return BiProjectSourceTableRelationConditions;
};
