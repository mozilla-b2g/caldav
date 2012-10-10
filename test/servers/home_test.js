var debug = require('debug')('caldav:test');
var helper = require('./helper.js');
var Caldav = require('../../lib/caldav');
var assert = require('assert');

suite('home::', function() {
  test('detect', function(done) {
    helper.findEnvHome(function() {
      assert.ok(testEnv.homeUrl, 'should set home uri');
      done();
    });
  });
});
