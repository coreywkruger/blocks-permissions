const PermissionRepo = require('./src/repos/permissions'),
	async = require('async');

var PermissionistAPI = function(repo) {
	this.repo = repo;
};

PermissionistAPI.prototype.ping = function(cb) {
	cb(null, 'pong');
};

// Execute an arbitrary SQL query
PermissionistAPI.prototype.query = function(query) {
	return this.repo.query(query);
};

// Create a role
PermissionistAPI.prototype.createRole = function(appId, role, cb) {
  this.repo.createRole(appId, role, cb);
};

// Remove a role
PermissionistAPI.prototype.removeRole = function(appId, roleId, cb) {
	this.repo.removeRole(appId, roleId, cb);
};

// Get roles for app
PermissionistAPI.prototype.getRolesForApp = function(appId, cb) {
	this.repo.getRolesForApp(appId, cb);
};

// Get permissions for app
PermissionistAPI.prototype.getPermissionsForApp = function(appId, cb) {
	this.repo.getPermissionsForApp(appId, cb);
};

// Get permissions for entity grouped by role
PermissionistAPI.prototype.getPermissionsForEntityByRole = function(entity, id, cb) {
	this.repo.getPermissionsForEntityByRole(entity, id, cb);
};

// Get entity permissions for a particular entity
PermissionistAPI.prototype.getEntityPermissionsForEntity = function(entity_id, target_id, cb) {
	this.repo.getEntityPermissionsForEntity(entity_id, target_id, cb);
};

// Get entities who have a particular permission for a certain target entity
PermissionistAPI.prototype.getEntitiesByTargetId = function(target_id, permission_name, cb) {
	this.repo.getEntitiesByTargetId(target_id, permission_name, cb);
};

// Get permissions for entity type and id
PermissionistAPI.prototype.getPermissionsForEntity = function(entity, id, cb) {
	this.repo.getPermissionsForEntity(entity, id, cb);
};

// Get permissions for role
PermissionistAPI.prototype.getPermissionsForRole = function(role, cb) {
	this.repo.getPermissionsForRole(role, cb);
};

// Get roles for entity
PermissionistAPI.prototype.getRolesForEntity = function(entity, id, cb) {
	this.repo.getRolesForEntity(entity, id, cb);
};

// Get roles for entities
PermissionistAPI.prototype.getEntitiesRolesMap = function(entity, ids, cb) {
	this.repo.getEntitiesRolesMap(entity, ids, cb);
};

// Assign permissions to entity
PermissionistAPI.prototype.assignPermissionsToEntity = function(permissions, entity, id, cb) {
	this.repo.assignPermissionsToEntity(permissions, entity, id, cb);
};

// Assign role to entity
PermissionistAPI.prototype.assignRoleToEntity = function(roleName, entity, id, cb) {
	this.repo.assignRoleToEntity(roleName, entity, id, cb);
};

// Unassign role to entity
PermissionistAPI.prototype.unassignRoleToEntity = function(roleName, entity, id, cb) {
	this.repo.unassignRoleToEntity(roleName, entity, id, cb);
};

PermissionistAPI.prototype.create = function(appId, permissionName, cb){
  if(!appId || !permissionName){
    return cb(new Error('Cannot create a permission without an appId or name'));
  }
  return this.repo.createPermission(appId, permissionName, cb);
}

PermissionistAPI.prototype.assignPermissionToRole = function(roleId, permissionId, cb){
  return this.repo.assignPermissionToRole(roleId, permissionId, cb);
};

PermissionistAPI.prototype.removePermissionFromRole = function(roleId, permissionId, cb){
  return this.repo.removePermissionFromRole(roleId, permissionId, cb);
}

// Seed permisions for development purposes
PermissionistAPI.prototype.seed = function(params, cb) {
	async.series([

		function(cb) {
			this.repo.seedApps(params.apps, cb);
		}.bind(this),
		function(cb) {
			this.repo.seedRoles(params.roles, cb);
		}.bind(this),
		function(cb) {
			this.repo.seedPermissions(params.permissions, cb);
		}.bind(this),
		function(cb) {
			this.repo.seedRolePermissions(params.rolePermissions, cb);
		}.bind(this)
	], function(err, results) {
		cb(err, results);
	});
};

// Synchronize model schema
PermissionistAPI.prototype.syncModels = function(cb) {
	this.repo.syncModels(cb);
};

module.exports = PermissionistAPI;
