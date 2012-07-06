requireRequest();
testSupport.lib('request/propfind');

suite('caldav/request/propfind', function() {
  var Abstract,
      Propfind,
      FakeXhr,
      Connection,
      Xhr,
      con,
      Template,
      oldXhrClass,
      SaxResponse;

  var url = 'http://google.com',
      subject;

  suiteSetup(function() {
    Abstract = Caldav.require('request/abstract');
    Propfind = Caldav.require('request/propfind');
    SaxResponse = Caldav.require('sax/dav_response');
    FakeXhr = Caldav.require('support/fake_xhr');
    Template = Caldav.require('template');
    Xhr = Caldav.require('xhr');
    Connection = Caldav.require('connection');

    oldXhrClass = Xhr.prototype.xhrClass;
    Xhr.prototype.xhrClass = FakeXhr;
  });

  suiteTeardown(function() {
    Xhr.prototype.xhrClass = oldXhrClass;
  });

  setup(function() {
    con = new Connection();
    subject = new Propfind(con, { url: url });
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

  test('.depth', function() {
    subject.depth = 10;
    assert.equal(subject.xhr.headers.Depth, 10);
    assert.equal(subject.depth, 10);
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

    testSupport.defineSample('xml/propget.xml', function(data) {
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
