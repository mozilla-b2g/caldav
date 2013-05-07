testSupport.lib('xhr');
testSupport.lib('connection');
testSupport.lib('http/basic_auth');
testSupport.helper('fake_xhr');

suite('http/basic_auth', function() {

  var XHR;
  var FakeXhr;
  var Connection;
  var BasicAuth;

  suiteSetup(function() {
    FakeXhr = Caldav.require('support/fake_xhr');
    XHR = Caldav.require('xhr');
    Connection = Caldav.require('connection');
    BasicAuth = Caldav.require('http/basic_auth');
  });

  var subject;
  var connection;
  var url = 'http://foo.com/bar';

  setup(function() {
    connection = new Connection({
      user: 'jlal',
      password: 'foo',
      domain: 'google.com'
    });

    subject = new BasicAuth(connection, {
      url: url,
      xhrClass: FakeXhr
    });
  });

  test('initialization', function() {
    assert.instanceOf(subject, XHR);
    assert.equal(subject.url, url);
  });

  suite('#send', function() {
    test('success', function() {
      var xhr = subject.send();

      assert.deepEqual(
        xhr.openArgs,
        [
          'GET',
          url,
          subject.async,
          connection.user,
          connection.password
        ]
      );
    });



  });

});
