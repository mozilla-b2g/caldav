testSupport.lib('xhr');
testSupport.lib('connection');
testSupport.lib('querystring');
testSupport.lib('oauth2');
testSupport.lib('http/oauth2');
testSupport.helper('fake_xhr');

suite('http/oauth2', function() {
  var XHR;
  var FakeXhr;
  var Connection;
  var GoogleOauth;
  var OAuth;
  var QueryString;

  suiteSetup(function() {
    FakeXhr = Caldav.require('support/fake_xhr');
    XHR = Caldav.require('xhr');
    Connection = Caldav.require('connection');
    GoogleOauth = Caldav.require('http/oauth2');
    QueryString = Caldav.require('querystring');
    OAuth = Caldav.require('oauth2');
  });

  var subject;
  var connection;

  setup(function() {
    connection = new Connection({
      domain: 'google.com',
      oauth: { code: 'xxx' },
      apiCredentials: {
        url: 'http://foobar.com/',
        client_id: 'client_id',
        client_secret: 'client_secret',
        redirect_uri: 'redirect_uri'
      }
    });

    subject = new GoogleOauth(connection, {
      xhrClass: FakeXhr,
      url: 'http://bar.com'
    });
  });

  test('initialization', function() {
    assert.instanceOf(subject, XHR);
    assert.deepEqual(subject.oauth.apiCredentials, connection.apiCredentials);
  });

  test('without oauth code/refresh_token', function() {
    connection.oauth = {};
    assert.throws(function() {
      new GoogleOauth(connection, {});
    }, /oauth/);
  });

  suite('.send', function() {
    testSupport.mock.useFakeXHR();

    var updatesConnection;
    setup(function() {
      updatesConnection = false;
      connection.onupdate = function() {
        updatesConnection = true;
      };
    });

    function buildRequest() {
      return new GoogleOauth(connection, {
        url: 'foo/bar',
        xhrClass: FakeXhr
      });
    }

    function buildResponse(data) {
      var result = {
        issued_at: Date.now(),
        expires_in: 3600,
        access_token: 'access_token',
        token_type: 'Bearer'
      };

      var key;
      for (key in data) {
        result[key] = data[key];
      }

      return result;
    }

    var request;
    var response;

    suite('with code', function() {
      setup(function() {
        response = buildResponse({
          refresh_token: 'refresh',
          user: 'gotuser'
        });
        request = buildRequest();
      });

      test('fetches access_token then sends', function(done) {
        var isComplete = false;
        var xhr;

        subject.oauth.authenticateCode = function(code, callback) {
          assert.equal(code, connection.oauth.code, 'sends correct code');
          setTimeout(function() {
            assert.ok(!xhr.sendArgs, 'has not sent request yet');
            callback(null, response);
            assert.ok(updatesConnection, 'sends connection update event');
            assert.deepEqual(connection.oauth, response, 'updates connection');
            assert.equal(connection.user, 'gotuser', 'updates user');

            assert.ok(xhr.sendArgs, 'sent request');
            isComplete = true;
            xhr.respond();
          });
        };

        xhr = subject.send(function() {
          assert.ok(isComplete, 'is complete');
          done();
        });
      });
    });

    suite('with expired access_token', function() {

      var expectedOauth;
      setup(function() {
        // no refresh_token intentionally
        response = buildResponse();

        connection.oauth = buildResponse({
          issued_at: Date.now() - 10000,
          expires_in: 3600,
          refresh_token: 'refresh_me'
        });

        request = buildRequest();

        expectedOauth = {};
        for (var key in response) {
          expectedOauth[key] = response[key];
        }

        expectedOauth.refresh_token = connection.oauth.refresh_token;
      });

      test('refreshes access_token', function(done) {
        var isComplete = false;
        var xhr;

        subject.oauth.refreshToken = function(refreshToken, callback) {
          assert.equal(
            refreshToken,
            connection.oauth.refresh_token,
            'sends correct refresh token'
          );


          setTimeout(function() {
            assert.ok(!xhr.sendArgs, 'has not sent request yet');
            callback(null, response);
            assert.ok(
              updatesConnection, 'sends connection update event'
            );

            assert.deepEqual(
              connection.oauth, expectedOauth, 'updates connection'
            );

            assert.ok(xhr.sendArgs, 'sent request');
            isComplete = true;
            xhr.respond();
          });
        };

        xhr = subject.send(function() {
          assert.ok(isComplete, 'is complete');
          done();
        });

      });
    });

    suite('with 401 response', function() {
    });
  });

});
