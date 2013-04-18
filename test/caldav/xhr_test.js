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

    setup(function() {
      responseXhr = null;
    });

    suite('when xhr is a success and responds /w data', function() {
      var response = '<html></html>', cb, xhr;

      setup(function(done) {
        request({
          data: data,
          url: url,
          method: 'PUT'
        });
        cb = callback.bind(this, done);
        xhr = subject.send(cb);

        // should be waiting inbetween requests
        assert.deepEqual(subject.waiting, true);

        xhr.readyState = 4;
        xhr.responseText = response;
        xhr.onreadystatechange();
      });

      test('should not be waiting after response', function() {
        assert.equal(subject.waiting, false);
      });
    });

    suite('when abort is called on the request', function() {
      var aborted, xhr;

      setup(function() {
        request({
          data: data,
          url: url,
          method: 'PUT'
        });
        xhr = subject.send(callback);

        // should be waiting inbetween requests
        assert.deepEqual(subject.waiting, true);

        aborted = false;
      });

      test('underlying request should be aborted', function(done) {
        xhr.abort = function() {
          aborted = true;
        };

        subject.abort(function() {
          assert.deepEqual(true, aborted);
          assert.deepEqual(false, subject.waiting);
          done();
        });
      });
    });
  });

  suite('requests real files', function() {
    function request(path, globalOptions) {
      path = 'fixtures/' + path;

      if (typeof(__dirname) !== 'undefined') {
        path = 'file://' + __dirname + '/' + path;
      } else {
        path = '/test/caldav/' + path;
      }

      return new Xhr({ url: path, globalXhrOptions: globalOptions });
    }

    test('get', function(done) {
      subject = request('file.txt');
      subject.send(function(err, xhr) {
        var data = xhr.responseText;
        assert.equal(data.trim(), 'file');
        done();
      });
    });

    suite('.ondata', function() {
      var expected;
      var file = 'long.txt';

      setup(function(done) {
        if (expected) {
          done();
        }

        var req = request(file);
        req.send(function(err, xhr) {
          expected = xhr.responseText;
          done();
        });
      });

      if (this.navigator && navigator.userAgent.indexOf('Mozilla') !== -1) {
        test('.ondata with chunked', function(done) {
          var subject = request('long.txt', { useMozChunkedText: true });
          var gotData = '';

          subject.ondata = function(chunk) {
            gotData += chunk;
          };

          var xhr = subject.send(function(err, xhr) {
            assert.ok(!xhr.responseText);
            assert.equal(xhr.responseType, 'moz-chunked-text');
            assert.equal(expected, gotData);
            done();
          });
        });
      }

      test('.ondata', function(done) {
        var subject = request(file);
        var gotData = '';

        subject.ondata = function(chunk) {
          gotData += chunk;
        };

        subject.send(function(err, xhr) {
          assert.equal(expected, gotData);
          done();
        });
      });


    });
  });

});
