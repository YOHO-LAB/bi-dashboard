/* eslint new-cap: "off" */
const options = require('../model-opts');

module.exports = function(sequelize, DataTypes) {
  const BiProjectSourceTableRelations = sequelize.define('BiProjectSourceTableRelations', {
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
    main_table_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    belong_table_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    join_type: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_distinct: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    }
  }, Object.assign(options, {
    tableName: 'bi_project_source_table_relations'
  }));

  BiProjectSourceTableRelations.associate = ({BiProjectSources, BiProjectSourceTableRelationConditions}) => {
    BiProjectSourceTableRelations.belongsTo(BiProjectSources, {as: 'ProjectSource', foreignKey: 'source_id'});
    BiProjectSourceTableRelations.hasMany(BiProjectSourceTableRelationConditions, {as: 'Conditions', foreignKey: 'relation_id'});
  };
  return BiProjectSourceTableRelations;
};
