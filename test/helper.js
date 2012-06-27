(function() {

  var specialRequires = {
    'chai': requireChai
  };

  testSupport = {
    isNode: (typeof(window) === 'undefined')
  };

  /* cross require */

  testSupport.require = function cross_require(file, callback) {
    if (file in specialRequires) {
      return specialRequires[file](file, callback);
    }

    if (typeof(window) === 'undefined') {
      var lib = require(__dirname + '/../' + file);
      if (typeof(callback) !== 'undefined') {
        callback(lib);
      }
    } else {
      window.require(file, callback);
    }
  }

  function setupChai(chai) {
    chai.Assertion.includeStack = true;
    assert = chai.assert;
  }

  function requireChai(file, callback) {
    var path;
    if (testSupport.isNode) {
      setupChai(require('chai'));
    } else {
      require('/vendor/chai.js', function() {
        setupChai(chai);
      });
    }
  }

  testSupport.require('chai');

  testSupport.loadSample = function(file, cb) {
    if (testSupport.isNode) {
      var root = __dirname + '/../samples/';
      require('fs').readFile(root + file, 'utf8', function(err, contents) {
        cb(err, contents);
      });
    } else {
      //xhr samples
    }
  };

  testSupport.defineSample = function(file, cb) {
    suiteSetup(function(done) {
      testSupport.loadSample(file, function(err, data) {
        if (err) {
          done(err);
        }
        cb(data);
        done();
      });
    });
  };

  testSupport.lib = function(lib, callback) {
     testSupport.require('/lib/webcals/' + lib, callback);
  };

  testSupport.helper = function(lib) {
    testSupport.require('/test/support/' + lib);
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

  requireRequest = function(callback) {
    testSupport.lib('xhr');
    testSupport.lib('sax');
    testSupport.lib('request/abstract');
    testSupport.lib('template');
    testSupport.helper('fake_xhr');

    //in the future we need a callback for browser support.
    if (typeof(callback) !== 'undefined') {
      callback();
    }
  };

}());


