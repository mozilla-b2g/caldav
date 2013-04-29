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

    var realXHR;
    suiteSetup(function() {
      realXHR = XHR.prototype.xhrClass;
      XHR.prototype.xhrClass = FakeXhr;
    });

    suiteTeardown(function() {
      XHR.prototype.xhrClass = realXHR;
    });

    var code = 'codexxx';
    test('without the .apiCredentials', function() {
      subject.connection.apiCredentials = null;

      assert.throws(function() {
        subject.oauth = { code: 'cool' };
        subject.authenticateCode();
      });
    });

    test('without code', function(done) {
      subject._authenticateCode(function(err, connection) {
        assert.instanceOf(err, Error, 'sends an error');
        done();
      });
    });

    suite('success', function() {
      var response = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      var expectedResponse;
      var expectedContent;
      var callsConnectionUpdate;

      teardown(function() {
        this.clock.restore();
      });

      setup(function() {
        this.clock = this.sinon.useFakeTimers();

        callsConnectionUpdate = false;

        connection.onupdate = function() {
          callsConnectionUpdate = true;
        };

        // copy expected properties over
        expectedResponse = {};
        for (var key in response) {
          expectedResponse[key] = response[key];
        }

        // set initial oauth state
        connection.oauth = { code: code };

        // expected post data
        expectedContent = QueryString.stringify({
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
          assert.deepEqual(connection.oauth, expectedResponse);

          done();
        });

        // verify xhr does the right thing
        assert.equal(xhr.sendArgs[0], expectedContent, 'sends correct params');
        assert.equal(xhr.openArgs[0], 'POST', 'is HTTP post verb');
        isComplete = true;

        expectedResponse.utc_expiry_time =
          Date.now() + (response.expires_in * 1000)

        xhr.respond(
          JSON.stringify(response),
          200,
          { 'Content-Type': 'application/json' }
        );
      });
    });

  });

});
