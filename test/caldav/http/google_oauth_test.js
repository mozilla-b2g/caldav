testSupport.lib('xhr');
testSupport.lib('connection');
testSupport.lib('querystring');
testSupport.lib('http/google_oauth');
testSupport.helper('fake_xhr');

suite('http/google_oauth', function() {
  var XHR;
  var FakeXhr;
  var Connection;
  var GoogleOauth;
  var QueryString;

  suiteSetup(function() {
    FakeXhr = Caldav.require('support/fake_xhr');
    XHR = Caldav.require('xhr');
    Connection = Caldav.require('connection');
    GoogleOauth = Caldav.require('http/google_oauth');
    QueryString = Caldav.require('querystring');
  });

  function mockTime() {
    setup(function() {
      this.clock = this.sinon.useFakeTimers();
    });

    teardown(function() {
      this.clock.restore();
    });
  }

  function mockXHR() {
    var realXHR;
    suiteSetup(function() {
      realXHR = XHR.prototype.xhrClass;
      XHR.prototype.xhrClass = FakeXhr;
    });

    suiteTeardown(function() {
      XHR.prototype.xhrClass = realXHR;
    });
  }

  var subject;
  var connection;
  var url = 'http://foo.com/bar';

  setup(function() {
    connection = new Connection({
      domain: 'google.com',
      apiCredentials: {
        client_id: 'client_id',
        client_secret: 'client_secret',
        redirect_uri: 'redirect_uri'
      }
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

  suite('#_authenticateCode', function() {
    mockXHR();

    var code = 'codexxx';
    test('without the .apiCredentials', function() {
      subject.connection.apiCredentials = null;

      assert.throws(function() {
        subject._authenticateCode();
      });
    });

    test('without code', function(done) {
      connection.oauth = {};
      subject._authenticateCode(function(err) {
        assert.instanceOf(err, Error, 'sends an error');
        done();
      });
    });

    suite('success', function() {
      mockTime();

      var response = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      var expectedOauth;
      var expectedRequest;
      var callsConnectionUpdate;

      setup(function() {
        callsConnectionUpdate = false;

        connection.onupdate = function() {
          callsConnectionUpdate = true;
        };

        // copy expected properties over
        expectedOauth = {
          issued_at: Date.now()
        };
        for (var key in response) {
          expectedOauth[key] = response[key];
        }

        // set initial oauth state
        connection.oauth = { code: code };

        // expected post data
        expectedRequest = QueryString.stringify({
          code: code,
          client_id: connection.apiCredentials.client_id,
          client_secret: connection.apiCredentials.client_secret,
          redirect_uri: connection.apiCredentials.redirect_uri,
          grant_type: 'authorization_code'
        });
      });

      test('sending request', function(done) {
        var isComplete = false;
        var xhr = subject._authenticateCode(function(err) {
          assert.isNull(err);

          assert.isTrue(isComplete, 'completed assertions');
          assert.isTrue(callsConnectionUpdate, 'updated connection');
          assert.deepEqual(connection.oauth, expectedOauth);

          done();
        });

        // verify xhr does the right thing
        assert.equal(xhr.sendArgs[0], expectedRequest, 'sends correct params');
        assert.equal(xhr.openArgs[0], 'POST', 'is HTTP post verb');
        isComplete = true;

        xhr.respond(
          JSON.stringify(response),
          200,
          { 'Content-Type': 'application/json' }
        );
      });
    });
  });

  suite('#_refreshTokens', function() {
    test('without connection.oauth.refresh_token', function(done) {
      subject.oauth = {};
      subject._refreshTokens(function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    suite('success', function() {
      mockTime();
      mockXHR();

      var startingOauth = {
        refresh_token: 'xxx',
        access_token: 'old',
        expires_in: 3600,
        token_type: 'Bearer',

        // this is here purely so we can observe the change
        issued_at: 111
      };

      var response = {
        access_token: 'newcode',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      var expectedOauth;
      var expectedRequest;
      var callsConnectionUpdate = false;
      setup(function() {
        connection.oauth = startingOauth;

        callsConnectionUpdate = false;
        connection.onupdate = function() {
          callsConnectionUpdate = true;
        };

        expectedOauth = {
          refresh_token: startingOauth.refresh_token,
          access_token: response.access_token,
          expires_in: response.expires_in,
          token_type: response.token_type,
          issued_at: Date.now()
        };

        expectedRequest = QueryString.stringify({
          refresh_token: response.refresh_token,
          client_id: connection.apiCredentials.client_id,
          client_secret: connection.apiCredentials.client_secret,
          grant_type: 'refresh_token'
        });
      });


      test('send request', function(done) {
        var isComplete = false;
        var xhr = subject._refreshTokens(function() {
          assert.isTrue(isComplete, 'assertions complete');
          assert.isTrue(callsConnectionUpdate);

          assert.deepEqual(connection.oauth, expectedOauth);
          done();
        });

        assert.deepEqual(xhr.sendArgs[0], expectedRequest, 'sent formdata');

        isComplete = true;

        xhr.respond(
          JSON.stringify(response),
          200,
          { 'Content-Type': 'application/json' }
        );
      });

    });
  });

});
