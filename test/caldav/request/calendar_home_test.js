requireRequest();

testSupport.lib('request/propfind');
testSupport.lib('request/calendar_home');

suite('caldav/request/propfind', function() {
  var Propfind;
  var Connection;
  var Home;
  var subject;
  var con;

  var url = 'http://google.com',
      subject;

  suiteSetup(function() {
    Propfind = Caldav.require('request/propfind');
    Connection = Caldav.require('connection');
    Home = Caldav.require('request/calendar_home');
  });

  setup(function() {
    con = new Connection();
    subject = new Home(con, {
      url: url
    });
  });

  test('initialization', function() {
    assert.equal(subject.url, url);
    assert.equal(subject.connection, con);
  });

});

