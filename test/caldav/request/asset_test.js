requireRequest();
testSupport.lib('request/asset');

suite('caldav/request/asset.js', function() {

  // classes
  var Asset;
  var Xhr;
  var Errors;
  var Connection;
  var SAX;
  var FakeXhr;

  // instances
  var subject;
  var oldXhrClass;
  var con;
  var url = '/foo.ics';
  var options = {
    url: url,
    configOpt: true
  };

  function lastXHR() {
    return FakeXhr.instances.pop();
  }

  suiteSetup(function() {
    Asset = Caldav.require('request/asset');
    FakeXhr = Caldav.require('support/fake_xhr');
    Xhr = Caldav.require('xhr');
    Connection = Caldav.require('connection');
    Errors = Caldav.require('errors');

    oldXhrClass = Xhr.prototype.xhrClass;
    Xhr.prototype.xhrClass = FakeXhr;
  });

  suiteTeardown(function() {
    Xhr.prototype.xhrClass = oldXhrClass;
  });

  setup(function() {
    con = new Connection({
      password: 'password',
      user: 'user'
    });

    subject = new Asset(con, url);
    FakeXhr.instances.length = 0;
  });

  test('#initializer', function() {
    assert.equal(subject.connection, con);
    assert.equal(subject.url, url);
  });

  suite('#get', function() {

    test('with etag', function(done) {
      subject.get({ etag: 'foo' }, function(err, data, xhr) {
        assert.equal(xhr.headers['If-None-Match'], 'foo');
        done();
      });

      var xhr = lastXHR();
      xhr.respond('', 200);
    });

    test('no options', function(done) {
      var content = 'content';

      subject.get(function(err, data, xhr) {
        assert.ok(!err);
        assert.equal(data, content);
        assert.equal(xhr.openArgs[0], 'GET');
        assert.equal(xhr.headers['Content-Type'], subject.contentType);
        done();
      });

      var xhr = lastXHR();
      xhr.respond(content, 200);
    });

  });

  suite('#put', function() {
    test('with error', function() {
      subject.put({}, '', function(err) {
        assert.ok(err, 'returns error');
        assert.instanceOf(err, Errors.Authentication, 'assets validate http');
      });

      var xhr = lastXHR();
      xhr.respond('', 401);
    });

    test('success', function(done) {
      var content = 'foo';
      subject.put({ etag: 'x' }, content, function(err, data, xhr) {
        assert.equal(xhr.openArgs[0], 'PUT');
        assert.equal(xhr.sendArgs[0], content);
        done();
      });

      var xhr = lastXHR();
      xhr.respond('', 201);
    });
  });

  test('#delete', function(done) {
    subject.delete({ etag: 'x' }, function(err, data, xhr) {
      assert.equal(xhr.openArgs[0], 'DELETE');
      done();
    });

    var xhr = lastXHR();
    xhr.respond('', 201);
  });

});
