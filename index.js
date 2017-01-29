const PermissionsDB = require('./db'),
  PermissionsRepo = require('./src/repos/permissions'),
  PermissionsAPI = require('./api');

var initialize = function(config, cb) {
  PermissionsDB.initialize(config, function(err, db) {
    if (err !== null) {
      cb(err);
    } else {
      cb(null, new PermissionsAPI(new PermissionsRepo(db)));
    }
  });
};

module.exports = {
  initialize: initialize,
  api: PermissionsAPI
};
