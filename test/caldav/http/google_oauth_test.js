testSupport.lib('xhr');
testSupport.lib('connection');
testSupport.lib('http/google_oauth');
testSupport.helper('fake_xhr');

suite('http/google_oauth', function() {

  var XHR;
  var FakeXhr;
  var Connection;
  var GoogleOauth;

  suiteSetup(function() {
    FakeXhr = Caldav.require('support/fake_xhr');
    XHR = Caldav.require('xhr');
    Connection = Caldav.require('connection');
    GoogleOauth = Caldav.require('http/google_oauth');
  });

  var subject;
  var connection;
  var url = 'http://foo.com/bar';

  setup(function() {
    connection = new Connection({
      domain: 'google.com'
    });

    subject = new GoogleOauth(connection, {
      url: url,
      xhrClass: FakeXhr,
      url: url
    });
  });

  test('initialization', function() {
    assert.instanceOf(subject, XHR);
    assert.equal(subject.url, url);
  });

});

