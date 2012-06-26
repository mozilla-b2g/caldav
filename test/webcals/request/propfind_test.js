requireRequest();

suite('webcals/request/propfind', function() {
  var Abstract,
      Propfind,
      FakeXhr,
      Xhr,
      Template,
      oldXhrClass,
      SaxResponse;

  var url = 'http://google.com',
      subject;

  suiteSetup(function() {
    Abstract = Webcals.require('request/abstract');
    Propfind = Webcals.require('request/propfind');
    SaxResponse = Webcals.require('sax/dav_response');
    FakeXhr = Webcals.require('support/fake_xhr');
    Template = Webcals.require('template');
    Xhr = Webcals.require('xhr');

    oldXhrClass = Xhr.prototype.xhrClass;
    Xhr.prototype.xhrClass = FakeXhr;
  });

  suiteTeardown(function() {
    Xhr.prototype.xhrClass = oldXhrClass;
  });

  setup(function() {
    subject = new Propfind(url);
    FakeXhr.instances.length = 0;
  });

  test('initializer', function() {
    assert.instanceOf(subject, Abstract);
    assert.instanceOf(subject.template, Template);
    assert.deepEqual(subject._props, []);
    assert.equal(
      subject.sax.handles['DAV:/response'],
      SaxResponse
    );

    assert.equal(subject.xhr.headers['Depth'], 0);
    assert.equal(subject.xhr.method, 'PROPFIND');
  });

  test('#prop', function() {
    var expected = subject.template.tag('test');

    subject.prop('test');

    assert.deepEqual(subject._props, [expected]);
  });

  test('#_createPayload', function() {
    subject.prop('foo');
    subject.prop('bar');

    var tags = [
      '<N0:foo />',
      '<N0:bar />'
    ].join('');

    var expected = [
      subject.template.doctype,
      '<N0:propfind xmlns:N0="DAV:">',
        '<N0:prop>', tags, '</N0:prop>',
      '</N0:propfind>'
    ].join('');

    var result = subject._createPayload();

    console.log(result);

    assert.equal(subject._createPayload(), expected);
  });

  test('#_processResult', function(done) {
    var inner = {},
        req = {};

    subject.sax.root = {
      multistatus: inner
    };

    subject._processResult(req, function(err, obj, xhr) {
      assert.equal(xhr, req);
      assert.equal(obj, inner);
      assert.equal(err, null);
      done();
    });
  });

  suite('integration', function() {
    var xml,
        data,
        result,
        xhr,
        calledWith;

    defineSample('xml/propget.xml', function(data) {
      xml = data;
    });

    setup(function(done) {
      subject.prop('foo');

      subject.send(function(err, tree) {
        data = tree;
        done();
      });

      xhr = FakeXhr.instances.pop();
      xhr.respond(xml, 207);
    });

    test('simple tree', function() {
      assert.ok(data['/calendar/user/']);
    });
  });

});
