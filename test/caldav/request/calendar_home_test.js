requireRequest();

testSupport.lib('request/propfind');
testSupport.lib('request/calendar_home');
testSupport.helper('mock_request');

suite('caldav/request/propfind', function() {
  var Connection;
  var MockRequest;
  var MockPropfind;
  var Home;
  var subject;
  var con;

  var url = 'http://google.com',
      subject;

  suiteSetup(function() {
    Connection = Caldav.require('connection');
    Home = Caldav.require('request/calendar_home');
    MockRequest = Caldav.require('support/mock_request');
  });

  suiteSetup(function() {
    MockPropfind = MockRequest.create(['prop']);
  });

  setup(function() {
    MockPropfind.reset();

    con = new Connection();
    subject = new Home(con, {
      url: url,
      Propfind: MockPropfind
    });
  });

  test('initialization', function() {
    assert.equal(subject.url, url);
    assert.equal(subject.connection, con);
  });

  test('_findPrincipal', function() {
    var err, data, response = {};

    subject._findPrincipal(url, function() {
      err = arguments[0];
      data = arguments[1];
    });

    var req = MockPropfind.instances[0];
    assert.equal(req.options.url, url);
    assert.deepEqual(req.propCalls, [
      ['current-user-principal'],
      ['principal-URL']
    ]);

    response[url] = {
      'current-user-principal': {
        status: '200',
        value: 'foo.com/'
      }
    };

    // respond to request
    req.respond(null, response);

    assert.equal(data, 'foo.com/');
  });

});

