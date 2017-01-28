module.exports = function(sequelize, DataTypes) {
  var RolePermission = sequelize.define('RolePermission', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.UUID,
    },
    permission_id: {
      type: DataTypes.UUID,
    }
  }, {
    tableName: 'role_permissions',
    timestamps: false,
    classMethods: {
      associate: function(models) {
        RolePermission.belongsTo(models.Role, {foreignKey: 'role_id'});
        RolePermission.belongsTo(models.Permission, {foreignKey: 'permission_id'});
      }
    }
  });

  return RolePermission;
};
