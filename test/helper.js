var chai = require('chai'),
    fs = require('fs');

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

Webcals = require('../lib/webcals/webcals.js');
