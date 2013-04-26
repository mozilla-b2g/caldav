testSupport.lib('xhr');
testSupport.lib('connection');
testSupport.lib('http/basic_auth');
testSupport.lib('http/google_oauth');

suite('caldav/connection', function() {

  var Connection;
  var XHR;
  var BasicAuth;

  suiteSetup(function() {
    Connection = Caldav.require('connection');
    XHR = Caldav.require('xhr');
    BasicAuth = Caldav.require('http/basic_auth');
  });

  var subject;
  var user = 'foo';
  var password = 'bar';
  var domain = 'http://foo.com';

  setup(function() {
    subject = new Connection({
      user: user,
      password: password,
      domain: domain
    });
  });

  suite('initialization', function() {

    test('assignment', function() {
      assert.equal(subject.user, user);
      assert.equal(subject.password, password);
      assert.equal(subject.domain, domain);
    });

    test('when domain has trailing slash', function() {
      subject = new Connection({
        domain: domain + '/'
      });

      assert.equal(subject.domain, domain, 'should remove trailing slash');
    });
  });

  suite('.requiresIntialAuth', function() {
    test('basic auth', function() {
      assert.isFalse(subject.requiresIntialAuth);
    });

    test('google oauth', function() {
      subject = new Connection({ httpHandler: 'google_oauth' });
      assert.isTrue(subject.requiresIntialAuth);
    });
  });

  suite('#request', function() {

    function commonCases() {
      test('url without domain', function() {
        var request = subject.request({
          url: 'bar.json'
        });

        // we add slash
        assert.equal(request.url, domain + '/bar.json');
      });
    }

    suite('basic auth (default)', function() {

      test('credentails', function() {
        var result = subject.request({
          url: domain
        });

        assert.instanceOf(result, BasicAuth);
        assert.equal(result.url, domain);
        assert.equal(result.password, password);
        assert.equal(result.user, user);
      });

      commonCases();
    });

  });

});
