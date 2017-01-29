module.exports = function(sequelize, DataTypes) {
  var EntityPermission = sequelize.define('EntityPermission', {
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
    target_id: {
      type: DateTypes.STRING
    },
    permission_id: {
      type: DataTypes.UUID
    }
  }, {
    tableName: 'entity_permissions',
    timestamps: false,
    classMethods: {
      associate: function(models) {
        EntityPermission.belongsTo(models.Permission, {foreignKey: 'permission_id'});
      }
    }
  });

  return EntityPermission;
};
