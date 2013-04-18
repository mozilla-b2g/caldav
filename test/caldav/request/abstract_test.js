requireRequest();

suite('caldav/request/abstract.js', function() {
  var subject;
  var Abstract;
  var Xhr;
  var Connection;
  var con;
  var FakeXhr;
  var SAX;
  var oldXhrClass;
  var url = 'http://google.com/';
  var options = {
    url: url,
    configOpt: true
  };

  suiteSetup(function() {
    Abstract = Caldav.require('request/abstract');
    FakeXhr = Caldav.require('support/fake_xhr');
    Xhr = Caldav.require('xhr');
    SAX = Caldav.require('sax');
    Connection = Caldav.require('connection');

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
    subject = new Abstract(con, options);
    FakeXhr.instances.length = 0;
  });

  test('#_createPayload', function() {
    assert.equal(subject._createPayload(), '');
  });

  test('#initializer', function() {
    assert.instanceOf(subject.xhr, Xhr);
    assert.equal(subject.xhr.url, url);
    assert.equal(subject.configOpt, options.configOpt);
    assert.equal(subject.connection, con);
    assert.instanceOf(subject.sax, SAX);
    assert.equal(subject.xhr.headers['Content-Type'], 'text/xml');
  });

  test('xhr password options', function() {
    var subject = new Abstract(con, {
      url: url
    });

    var xhr = subject.xhr;

    assert.equal(xhr.password, 'password');
    assert.equal(xhr.user, 'user');
  });

  suite('#send', function(done) {
    var xhr;

    function getXhr() {
      return FakeXhr.instances.pop();
    }

    test('should return a Caldav.Xhr object', function() {
      var req = subject.send(function() {});
      assert.deepEqual(url, req.url)
      assert.deepEqual(con.user, req.user);
      assert.deepEqual(con.password, req.password);
    });

    suite('error', function() {
      var calledWith;

      setup(function(done) {
        subject.send(function() {
          calledWith = arguments;
          done();
        });

        xhr = getXhr();
        xhr.respond('NOT XML <div>', 500);
      });

      test('on response', function() {
        assert.equal(calledWith[0].code, 500);
      });
    });

    suite('success', function() {
      var calledWith;
      var xml = '<el><item>value</item></el>';

      setup(function(done) {
        subject.send(function() {
          calledWith = arguments;
          done();
        });

        xhr = getXhr();
        xhr.respond(xml, 207);
      });

      test('on response', function() {
        assert.equal(calledWith[0], null);
        assert.deepEqual(calledWith[1], {
          el: {
            item: { value: 'value' }
          }
        });
      });
    });
  });

});
