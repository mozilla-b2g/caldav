requireRequest();

suite('webcals/request/abstract.js', function() {
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
    Abstract = Webcals.require('request/abstract');
    FakeXhr = Webcals.require('support/fake_xhr');
    Xhr = Webcals.require('xhr');
    SAX = Webcals.require('sax');

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

  test('#_createXhr', function() {
    var result = subject._createXhr();
    assert.instanceOf(result, Xhr);
    assert.equal(result.url, url);
  });

  test('#_createPayload', function() {
    assert.equal(subject._createPayload(), '');
  });

  test('#initializer', function() {
    assert.equal(subject.url, url);
    assert.equal(subject.configOpt, options.configOpt);
    assert.instanceOf(subject.sax, SAX);
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
        xhr.respond(xml, 200);
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
