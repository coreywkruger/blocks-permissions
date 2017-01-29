var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");

var initialize = function(connectionString, cb) {
  var env = process.env.NODE_ENV || "development";
  var db = {
      models: {}
    };
  var logging = config.logging || 'console';
  var loggingMap = {
    'console': console.log,
    'none': function(){}
  };
  var loggingFunc = loggingMap[logging] || loggingMap.console;
  var options = {
    logging: loggingFunc
  };
  var sequelize = new Sequelize(connectionString, options);
  var modelsDir = __dirname + '/src/models';

  // Import models
  fs
    .readdirSync(modelsDir)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
      var model = sequelize.import(path.join(modelsDir, file));
      db.models[model.name] = model;
    });

  Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
      db.models[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  db.sequelize.authenticate()
    .then(function() {
      return cb(null, db);
    })
    .catch(function(err) {
      if (err) {
        return cb(err);
      }
    });

};

module.exports = {
  initialize: initialize
};
