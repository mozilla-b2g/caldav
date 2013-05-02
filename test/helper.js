(function() {

  // lazy defined navigator causes global leak warnings...

  var requireBak;
  var specialRequires = {
    'chai': requireChai
  };

  testSupport = {
    isNode: (typeof(window) === 'undefined')
  };

  /* stream hack for SAX */

  if (!testSupport.isNode) {
    window.navigator;
    requireBak = require;

    require = function require_shim(type) {
      if (type === 'stream') {
        throw new Error('this is not node');
      }

      requireBak.apply(this, arguments);
    };
  }

  /* cross require */

  testSupport.require = function cross_require(file, callback) {
    if (file in specialRequires) {
      return specialRequires[file](file, callback);
    }

    if (!(/\.js$/.test(file))) {
      file += '.js';
    }

    if (typeof(window) === 'undefined') {
      var lib = require(__dirname + '/../' + file);
      if (typeof(callback) !== 'undefined') {
        callback(lib);
      }
    } else {
      window.require(file, callback);
    }
  };

  /* sinon */
  if (testSupport.isNode) {
    global.sinon = require('sinon');
  } else {
    window.require('/node_modules/sinon/pkg/sinon.js');
  }

  setup(function() {
    this.sinon = sinon.sandbox.create();
  });

  teardown(function() {
    this.sinon.restore();
  });

  /* chai */

  function setupChai(chai) {
    chai.Assertion.includeStack = true;
    assert = chai.assert;
  }

  function requireChai(file, callback) {
    var path;
    if (testSupport.isNode) {
      setupChai(require('chai'));
    } else {
      require('/node_modules/chai/chai.js', function() {
        setupChai(chai);
      });
    }
  }

  testSupport.require('chai');

  if (!testSupport.isNode) {
    testSupport.require('/vendor/sax');
  }

  testSupport.loadSample = function(file, cb) {
    if (testSupport.isNode) {
      var root = __dirname + '/../samples/';
      require('fs').readFile(root + file, 'utf8', function(err, contents) {
        cb(err, contents);
      });
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/samples/' + file, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status !== 200) {
            cb(new Error('file not found or other error', xhr));
          } else {
            cb(null, xhr.responseText);
          }
        }
      };
      xhr.send(null);
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

  testSupport.mock = {
    useFakeXHR: function() {
      testSupport.helper('fake_xhr');
      testSupport.lib('xhr');

      var realXHR;
      var XHR;
      var FakeXhr;

      suiteSetup(function() {
        XHR = Caldav.require('xhr');
        FakeXhr = Caldav.require('support/fake_xhr');

        realXHR = XHR.prototype.xhrClass;
        XHR.prototype.xhrClass = FakeXhr;
      });

      suiteTeardown(function() {
        XHR.prototype.xhrClass = realXHR;
      });
    },

    /**
     * Mocks out a method
     *
     *    var called = testSupport.mock.method(subject, 'myMethod');
     *
     *    subject.myMethod('foo', 'bar');
     *
     *    called.args[0] === 'foo'; // true
     *    called.args[1] === 'bar'; // true
     *
     *
     * @return {Object} reference object.
     */
    method: function(obj, method, times) {
      var calledWith = {};
      var calls = 0;

      if (typeof(times) === 'undefined') {
        times = 1;
      }

      obj[method] = function() {
        if (calls.length > times) {
          throw new Error(
            method + ' called more then ' + times + 'time(s)'
          );
        }

        calledWith.args = arguments;
        calls++;
      };

      return calledWith;
    }

  };

  testSupport.lib = function(lib, callback) {
     testSupport.require('/lib/caldav/' + lib, callback);
  };

  testSupport.helper = function(lib) {
    testSupport.require('/test/support/' + lib);
  };

  Caldav = require('../lib/caldav/caldav.js');

  if (typeof(window) === 'undefined') {
    //in node we need to hack Caldav to do the right thing.
    var oldRequire = Caldav.require;

    Caldav.require = function exportRequireDev(path) {
      if (path.indexOf('support') === 0) {
        path = __dirname + '/' + path;
        return require(path);
      }
      return oldRequire(path);
    };
  }

  /* since we have global mocks easier to just include these globally */
  requireRequest = function(callback) {
    testSupport.lib('responder');
    testSupport.lib('oauth2');
    testSupport.lib('http/basic_auth');
    testSupport.lib('http/oauth2');
    testSupport.lib('connection');
    testSupport.lib('sax');
    testSupport.lib('sax/base');
    testSupport.lib('sax/dav_response');
    testSupport.lib('request/errors');
    testSupport.lib('request/abstract');
    testSupport.lib('template');
    testSupport.lib('request/propfind');

    //in the future we need a callback for browser support.
    if (typeof(callback) !== 'undefined') {
      callback();
    }
  };

}());


