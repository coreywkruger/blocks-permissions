module.exports = function(sequelize, DataTypes) {
  var Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    permission: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'permissions',
    timestamps: false
  });

  return Permission;
};
