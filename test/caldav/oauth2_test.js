testSupport.lib('querystring');
testSupport.lib('xhr');
testSupport.lib('oauth2');
testSupport.helper('fake_xhr');

suite('oauth', function() {
  var XHR;
  var FakeXhr;
  var OAuth;
  var QueryString;

  suiteSetup(function() {
    FakeXhr = Caldav.require('support/fake_xhr');
    XHR = Caldav.require('xhr');
    QueryString = Caldav.require('querystring');
    OAuth = Caldav.require('oauth2');
  });

  function mockTime() {
    setup(function() {
      this.clock = this.sinon.useFakeTimers();
    });

    teardown(function() {
      this.clock.restore();
    });
  }

  var subject;
  var apiCredentials = {
    url: 'http://foobar.com/',
    client_id: 'client_id',
    client_secret: 'client_secret',
    redirect_uri: 'redirect_uri'
  };

  setup(function() {
    subject = new OAuth(apiCredentials);
  });

  test('initialization', function() {
    assert.deepEqual(subject.apiCredentials, apiCredentials);
  });

  test('invalid credentials', function() {
    assert.throws(function() {
      new OAuth({ foo: 'bar' });
    }, /apiCredentials/);
  });

  suite('#authoriztionCode', function() {
    testSupport.mock.useFakeXHR();

    var code = 'codexxx';

    test('without code', function(done) {
      subject.authenticateCode(null, function(err) {
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

      var expectedResponse;
      var expectedRequest;

      setup(function() {
        // copy expected properties over
        expectedResponse = {
          issued_at: Date.now()
        };

        for (var key in response) {
          expectedResponse[key] = response[key];
        }

        // expected post data
        expectedRequest = QueryString.stringify({
          code: code,
          client_id: subject.apiCredentials.client_id,
          client_secret: subject.apiCredentials.client_secret,
          redirect_uri: subject.apiCredentials.redirect_uri,
          grant_type: 'authorization_code'
        });
      });

      test('sending request', function(done) {
        var isComplete = false;
        var xhr = subject.authenticateCode(code, function(err, result) {
          assert.isNull(err);

          assert.isTrue(isComplete, 'completed assertions');
          assert.deepEqual(result, expectedResponse);
          done();
        });


        // verify xhr does the right thing
        assert.equal(xhr.sendArgs[0], expectedRequest, 'sends correct params');
        assert.equal(xhr.openArgs[0], 'POST', 'is HTTP post verb');
        assert.equal(xhr.openArgs[1], apiCredentials.url, 'opened with url');
        isComplete = true;

        xhr.respond(
          JSON.stringify(response),
          200,
          { 'Content-Type': 'application/json' }
        );
      });

      test('with username_info', function(done) {
        var userInfoData = { email: 'myfooba.com' };
        var userInfo = subject.apiCredentials.user_info = {
          url: 'http://google.com/',
          field: 'email'
        };

        var isComplete = false;
        var xhr = subject.authenticateCode(code, function(err, data) {
          assert.isNull(err, 'no error');
          assert.ok(isComplete, 'completed testing');
          expectedResponse.user = userInfoData.email;
          assert.deepEqual(data, expectedResponse);
          done();
        });

        xhr.respond(
          JSON.stringify(response),
          200,
          { 'Content-Type': 'application/json' }
        );

        var userInfoXhr =
          FakeXhr.instances[FakeXhr.instances.length - 1];

        assert.notEqual(userInfoXhr, xhr, 'issued userinfo');

        assert.equal(
          userInfoXhr.openArgs[1],
          userInfo.url
        );

        assert.equal(
          userInfoXhr.headers['Authorization'],
          response.token_type + ' ' + response.access_token,
          'sets access token'
        );

        isComplete = true;

        userInfoXhr.respond(
          JSON.stringify(userInfoData),
          200,
          { 'Content-Type': 'application/json' }
        );
      });

    });
  });

  suite('refreshToken', function() {
    test('without .refresh_token', function() {
      assert.throws(function() {
        subject.refreshToken(null, function() {});
      }, /token/);
    });

    suite('success', function() {
      testSupport.mock.useFakeXHR();
      mockTime();

      var refreshToken = 'mytokenfoo';
      var response = {
        access_token: 'newcode',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      var expectedResponse;
      var expectedRequest;
      setup(function() {
        expectedResponse = {
          access_token: response.access_token,
          expires_in: response.expires_in,
          token_type: response.token_type,
          issued_at: Date.now()
        };

        expectedRequest = QueryString.stringify({
          refresh_token: refreshToken,
          client_id: subject.apiCredentials.client_id,
          client_secret: subject.apiCredentials.client_secret,
          grant_type: 'refresh_token'
        });
      });


      test('send request', function(done) {
        var isComplete = false;
        var xhr = subject.refreshToken(refreshToken, function(err, result) {
          assert.isNull(err);
          assert.isTrue(isComplete, 'assertions complete');
          assert.deepEqual(result, expectedResponse);
          done();
        });

        assert.deepEqual(xhr.sendArgs[0], expectedRequest, 'sent formdata');
        assert.equal(xhr.openArgs[1], apiCredentials.url, 'opened with url');
        isComplete = true;

        xhr.respond(
          JSON.stringify(response),
          200,
          { 'Content-Type': 'application/json' }
        );
      });
    });
  });

  suite('#accessTokenValid', function() {
    test('no access_token', function() {
      assert.isFalse(subject.accessTokenValid({ code: 'xxx' }));
    });

    test('access_token present but time invalid', function() {
      var oauth = {
        access_token: 'xxx',
        expires_in: 3600,
        issued_at: Date.now() - 3700
      };

      assert.isFalse(subject.accessTokenValid(oauth));
    });


    test('access_token present and not expired', function() {
      var oauth = {
        access_token: 'xxx',
        expires_in: 3600,
        issued_at: Date.now()
      };

      assert.isTrue(subject.accessTokenValid(oauth));
    });
  });


});

