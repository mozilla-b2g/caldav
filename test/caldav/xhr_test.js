testSupport.lib('xhr');
testSupport.helper('fake_xhr');

suite('webacls/xhr', function() {
  var subject,
      Xhr,
      FakeXhr;


  suiteSetup(function() {
    Xhr = Caldav.require('xhr');
    FakeXhr = Caldav.require('support/fake_xhr');
  });

  setup(function() {
    subject = new Xhr({
      method: 'POST'
    });
  });

  suite('initialization', function() {

    test('should set options on instance', function() {
      assert.equal(subject.method, 'POST');
    });

    suite('with global args', function() {
      var old;
      var opts = { system: true };

      setup(function() {
        var old = Xhr.prototype.globalXhrOptions;
        Xhr.prototype.globalXhrOptions = opts;
      });

      teardown(function() {
        Xhr.prototype.globalXhrOptions = old;
      });

      test('constructed xhr', function() {
        var subject = new Xhr({
          method: 'POST',
          xhrClass: FakeXhr
        });
        subject.send(function() {});
        assert.ok(subject.xhr);
        assert.equal(subject.xhr.constructorArgs[0], opts);
      });
    });
  });

  test('#_credentials', function() {
    // don't run this in node
    if (typeof(window) === 'undefined') {
      return;
    }

    var user = 'james';
    var password = 'lal';
    var expected = 'Basic ' + window.btoa(user + ':' + password);

    assert.equal(
      subject._credentials(user, password), expected
    );
  });

  suite('.abort', function() {
    suite('when there is an xhr object', function() {
      var aborted;

      setup(function() {
        aborted = false;
        subject.xhr = {
          abort: function() {
            aborted = true;
          }
        };
        subject.abort();
      });

      test('should call abort on the xhr object', function() {
        assert.equal(aborted, true);
      });
    });

    suite('when there is no xhr object', function() {
      test('should not fail', function() {
        subject.xhr = null;
        subject.abort();
      });
    });
  });

  suite('.send', function() {

    var data = '<html></html>',
        url = 'http://foo',
        xhr,
        responseXhr;

    function callback(done, data, xhr) {
      responseXhr = xhr;
      done();
    }

    function request(options) {
      options.xhrClass = FakeXhr;
      subject = new Xhr(options);
    }

    function opensXHR() {
      test('should create xhr', function() {
        assert.instanceOf(subject.xhr, FakeXhr);
      });

      test('should set headers', function() {
        assert.deepEqual(subject.xhr.headers, subject.headers);
      });

      test('should parse and send data', function() {
        assert.deepEqual(subject.xhr.sendArgs[0], data);
      });

      test('should open xhr', function() {
        assert.deepEqual(subject.xhr.openArgs, [
          subject.method,
          subject.url,
          subject.async,
          subject.user,
          subject.password
        ]);
      });
    }

    setup(function() {
      responseXhr = null;
    });

    test('with mozSystem', function() {
      if (typeof(window) === 'undefined')
        return;

      var user = 'user';
      var password = 'pass';
      var url = '/foo';

      request({
        globalXhrOptions: { mozSystem: true },
        user: user,
        password: password,
        method: 'GET',
        url: url
      });


      subject.send(function() {});
      var args = subject.xhr.openArgs;

      assert.deepEqual(
        args,
        ['GET', url, true]
      );

      assert.equal(
        subject.xhr.headers['Authorization'],
        subject._credentials(user, password)
      );
    });

    suite('when xhr is a success and responds /w data', function() {
      var response = '<html></html>', cb;

      setup(function(done) {
        var xhr;
        request({
          data: data,
          url: url,
          method: 'PUT'
        });
        cb = callback.bind(this, done);
        subject.send(cb);

        //should be waiting inbetween requests
        assert.equal(subject.waiting, true);

        xhr = subject.xhr;
        xhr.readyState = 4;
        xhr.responseText = response;
        xhr.onreadystatechange();
      });

      test('should not be waiting after response', function() {
        assert.equal(subject.waiting, false);
      });

      test('should send callback parsed data and xhr', function() {
        assert.equal(responseXhr, subject.xhr);
      });

      opensXHR();
    });

  });

});


