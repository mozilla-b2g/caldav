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

requireLib = function(lib) {
  return require(__dirname + '/../lib/caldav/' + lib);
};
