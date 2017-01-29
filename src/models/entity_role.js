module.exports = function(sequelize, DataTypes) {
  var EntityRole = sequelize.define('EntityRole', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    entity_id: {
      type: DataTypes.STRING
    },
    entity_type: {
      type: DataTypes.STRING
    },
    role_id: {
      type: DataTypes.UUID
    }
  }, {
    tableName: 'entity_roles',
    timestamps: false
  });

  return EntityRole;
};
