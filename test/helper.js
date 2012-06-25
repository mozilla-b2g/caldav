(function() {
  var chai = require('chai'),
      fs = require('fs'),
      path = require('path');

  chai.Assertion.includeStack = true;
  assert = chai.assert;

  loadSample = function(file, cb) {
    var root = __dirname + '/../samples/';
    fs.readFile(root + file, 'utf8', function(err, contents) {
      cb(err, contents);
    });
  };

  defineSample = function(file, cb) {
    suiteSetup(function(done) {
      loadSample(file, function(err, data) {
        if (err) {
          done(err);
        }
        cb(data);
        done();
      });
    });
  };

  requireLib = function(lib) {
    return require(__dirname + '/../lib/webcals/' + lib);
  };

  requireSupport = function(lib) {
    return require(__dirname + '/support/' + lib);
  }

  Webcals = require('../lib/webcals/webcals.js');

  if (typeof(window) === 'undefined') {
    //in node we need to hack Webcals to do the right thing.
    var oldRequire = Webcals.require;

    Webcals.require = function exportRequireDev(path) {
      if (path.indexOf('support') === 0) {
        path = __dirname + '/' + path;
        return require(path);
      }
      return oldRequire(path);
    }
  }

}());

