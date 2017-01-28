const async = require('async');
const uuid = require('node-uuid');

var PermissionRepo = function(db) {
  this.db = db;
};

PermissionRepo.prototype.ping = function(opts, cb) {
  cb(null, 'pong');
};

// Execute a query and return a bluebird promise
PermissionRepo.prototype.query = function(query) {
  return this.db.sequelize.query(query);
};

PermissionRepo.prototype.getPermissionsForEntityByRole = function(entity, id, cb) {
  this.getRolesForEntity(entity, id, function(err, roles) {
    if (err) {
      return cb(err);
    } else {
      var rolePermissions = {};
      async.each(roles, function(role, done) {
        this.getPermissionsForRole(role['name'], function(err,
          permissions) {
          rolePermissions[role['name']] = permissions;
          done();
        });
      }.bind(this), function(err) {
        cb(null, rolePermissions);
      });
    }
  }.bind(this));
};

PermissionRepo.prototype.getPermissionsForEntity = function(entity, id, cb) {
  this.db.sequelize.query(`
  SELECT perms.permission, perms.id 
  FROM (SELECT DISTINCT 
      p.id, p.permission, er.entity_id 
    FROM permissions p INNER JOIN 
      role_permissions rp 
    ON rp.permission_id = p.id INNER JOIN 
      entity_roles er on er.role_id = rp.role_id 
    ORDER BY p.permission ASC)
  AS perms 
  WHERE perms.entity_id = :id`, 
  {
    replacements: {
      entity: entity,
      id: id
    },
    type: this.db.sequelize.QueryTypes.SELECT
  })
  .then(function(permissions) {
    return cb(null, permissions);
  })
  .catch(function(err) {
    console.log(err);
    return cb(err);
  });
};

PermissionRepo.prototype.getPermissionsForRole = function(role, cb) {
  this.db.sequelize.query(`
  SELECT p.id, p.permission 
  FROM permissions p INNER JOIN 
    role_permissions rp ON p.id = rp.permission_id INNER JOIN 
      roles r on r.id = rp.role_id 
  WHERE r.name = :role 
  ORDER BY p.permission ASC`, 
  {
    replacements: {
      role: role
    },
    type: this.db.sequelize.QueryTypes.SELECT
  })
  .then(function(permissions) {
    return cb(null, permissions);
  })
  .catch(function(err) {
    console.log(err);
    return cb(err);
  });
};

// Get Roles for the given app id
PermissionRepo.prototype.getRolesForApp = function(app_id, cb) {
  this.db.sequelize.query(`SELECT * FROM roles r WHERE app_id = :app_id`, {
    replacements: {
      app_id: app_id
    },
    type: this.db.sequelize.QueryTypes.SELECT
  })
  .then(function(roles) {
    return cb(null, roles);
  })
  .catch(function(err) {
    console.log(err);
    return cb(err);
  });
};

// Get Roles for the given app id
PermissionRepo.prototype.getPermissionsForApp = function(app_id, cb) {
  this.db.sequelize.query(`SELECT * FROM permissions r WHERE app_id = :app_id ORDER BY r.permission ASC`, {
    replacements: {
      app_id: app_id
    },
    type: this.db.sequelize.QueryTypes.SELECT
  })
  .then(function(roles) {
    return cb(null, roles);
  })
  .catch(function(err) {
    console.log(err);
    return cb(err);
  });
};

PermissionRepo.prototype.getRolesForEntity = function(entity, id, cb) {
  this.db.sequelize.query(
  `SELECT * FROM roles r INNER JOIN entity_roles er ON r.id = er.role_id AND er.entity_id = :id`, {
    replacements: {
      entity: entity,
      id: id
    },
    type: this.db.sequelize.QueryTypes.SELECT
  })
  .then(function(roles) {
    return cb(null, roles);
  })
  .catch(function(err) {
    console.log(err);
    return cb(err);
  });
};

PermissionRepo.prototype.getEntitiesRolesMap = function(entity, ids, cb) {
  this.db.sequelize.query(
  `SELECT DISTINCT eer.entity_id, (SELECT array(SELECT r.name FROM roles r inner join entity_roles er on r.id = er.role_id WHERE er.entity_id = eer.entity_id)) as roles FROM entity_roles eer WHERE eer.entity_id = ANY (string_to_array(:ids, ','))`, {
    replacements: {
      entity: entity,
      ids: ids.join(',')
    },
    type: this.db.sequelize.QueryTypes.SELECT
  })
  .then(function(userRoles) {
    var userRolesMap = {};
    for(var i = 0; i < userRoles.length; i++) {
      userRolesMap[userRoles[i].entity_id] = userRoles[i].roles;
    }
    return cb(null, userRolesMap);
  })
  .catch(function(err) {
    console.log(err);
    return cb(err);
  });
};

PermissionRepo.prototype.assignRoleToEntity = function(roleName, entity, id, cb) {
  this.db.models.Role.findOne({
    where: {
      name: roleName
    }
  })
  .then(function(role) {
    return this.db.models.EntityRole.findOne({
      where: {
        entity_id: id,
        role_id: role.id
      }
    })
    .then(function(entityRole) {
      if (entityRole) {
        return cb('Role already assigned');
      }

      return this.db.models.EntityRole.create({
        id: uuid.v4(),
        entity_id: id,
        role_id: role.id
      })
      .then(function(entityRole) {
        return cb(null, entityRole);
      })
      .catch(function(err) {
        return cb(err);
      });
    }.bind(this))
  }.bind(this))
  .catch(function(err) {
    return cb(err);
  });
};

PermissionRepo.prototype.unassignRoleToEntity = function(roleName, entity, id, cb) {
  this.db.models.Role.findOne({
      where: {
        name: roleName
      }
    })
    .then(function(role) {
      return this.db.models.EntityRole.destroy({
          where: {
            entity_id: id,
            role_id: role.id
          }
        })
        .then(function() {
          return cb();
        }.bind(this))
        .catch(function(err) {
          return cb(err);
        });
    }.bind(this))
    .catch(function(err) {
      return cb(err);
    })
};

PermissionRepo.prototype.createRole = function(appId, role, cb) {
  var promise = this.db.models.Role.create({
      id: uuid.v4(),
      app_id: appId,
      owner_id: role.ownerId || '',
      owner_type: role.type || 'system',
      name: role.name,
      active: role.active || true
    })
  promise.then(function(role) {
      return cb(null, role);
    }.bind(this));
  promise.catch(function(err) {
      return cb(err);
    });
};

PermissionRepo.prototype.removeRole = function(appId, roleId, cb) {
  var promise = this.db.models.Role.destroy({
    where: {
      id: roleId,
      app_id: appId
    }
  });
  promise.then(function() {
    return cb();
  });
  promise.catch(function(err) {
    return cb(err);
  });
};

PermissionRepo.prototype.createPermission = function(appId, permissionName, cb){
  this.db.models.Permission.create({
    id: uuid.v4(),
    app_id: appId,
    permission: permissionName,
    active: true
  }).then(function(newPermission){
    return cb(null, newPermission);
  }).catch(cb);
};

PermissionRepo.prototype.createPermissions = function(appId, permissionNames, cb){
  var permissions = [];
  permissionNames.forEach(function(permission) {
    permissions.push({
      id: uuid.v4(),
      app_id: appId,
      permission: permission,
      active: true
    });
  });

  this.db.models.Permission.bulkCreate(permissions).then(function(newPermissions){
    return cb(null, newPermissions);
  }).catch(cb);
};

PermissionRepo.prototype.assignPermissionToRole = function(roleId, permissionId, cb){
  this.db.models.RolePermission.create({
    id: uuid.v4(),
    role_id: roleId,
    permission_id: permissionId
  }).then(function(){
    return cb();
  }).catch(cb);
}

PermissionRepo.prototype.removePermissionFromRole = function(roleId, permissionId, cb) {
  this.db.models.RolePermission.destroy({
    where: {
      role_id: roleId,
      permission_id: permissionId
    }
  }).then(() => cb()).catch((err) => cb(err));
}

PermissionRepo.prototype.syncModels = function(cb) {
  this.db.sequelize.sync({
      force: true
    })
    .then(function() {
      return cb(null);
    })
    .catch(function(err) {
      return cb(err);
    })
};

module.exports = PermissionRepo;