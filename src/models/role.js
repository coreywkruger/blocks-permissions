module.exports = function(sequelize, DataTypes) {
  var Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    owner_id: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'roles',
    timestamps: false,
  });

  return Role;
};
