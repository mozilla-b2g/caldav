requireRequest();

suite('caldav/request/abstract.js', function() {
  var subject;
  var Abstract;
  var Xhr;
  var FakeXhr;
  var SAX;
  var oldXhrClass;
  var url = 'http://google.com/';
  var options = {
    configOpt: true
  };

  suiteSetup(function() {
    Abstract = Caldav.require('request/abstract');
    FakeXhr = Caldav.require('support/fake_xhr');
    Xhr = Caldav.require('xhr');
    SAX = Caldav.require('sax');

    oldXhrClass = Xhr.prototype.xhrClass;
    Xhr.prototype.xhrClass = FakeXhr;
  });

  suiteTeardown(function() {
    Xhr.prototype.xhrClass = oldXhrClass;
  });

  setup(function() {
    subject = new Abstract(url, options);
    FakeXhr.instances.length = 0;
  });

  test('#_createPayload', function() {
    assert.equal(subject._createPayload(), '');
  });

  test('#initializer', function() {
    assert.instanceOf(subject.xhr, Xhr);
    assert.equal(subject.xhr.url, url);
    assert.equal(subject.configOpt, options.configOpt);
    assert.instanceOf(subject.sax, SAX);
    assert.equal(subject.xhr.headers['Content-Type'], 'text/xml');
  });

  test('xhr password options', function() {
    var subject = new Abstract(url, {
      password: 'password',
      user: 'user'
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
        assert.match(calledWith[0].message, /http error/);
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
        assert.equal(calledWith[2].xhr, xhr);
      });
    });
  });

});
