testSupport.lib('xhr');
testSupport.helper('fake_xhr');

suite('webacls/xhr', function() {
  var subject,
      Xhr,
      FakeXhr;


  suiteSetup(function() {
    Xhr = Webcals.require('xhr');
    FakeXhr = Webcals.require('support/fake_xhr');
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


