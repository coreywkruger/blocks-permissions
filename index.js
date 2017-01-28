const PermissionistDB = require('./db'),
  PermissionistRepo = require('./src/repos/permissions'),
  PermissionistAPI = require('./api');

var initialize = function(config, cb) {
  PermissionistDB.initialize(config, function(err, db) {
    if (err !== null) {
      cb(err);
    } else {
      cb(null, new PermissionistAPI(new PermissionistRepo(db)));
    }
  });
};

module.exports = {
  initialize: initialize,
  api: PermissionistAPI
};
