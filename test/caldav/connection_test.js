testSupport.lib('xhr');
testSupport.lib('connection');

suite('caldav/connection', function() {

  var subject;
  var Connection;
  var XHR;
  var user = 'foo';
  var password = 'bar';
  var domain = 'http://foo.com';

  suiteSetup(function() {
    Connection = Caldav.require('connection');
    XHR = Caldav.require('xhr');
  });

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


  suite('request', function() {

    test('credentails', function() {
      var result = subject.request({
        url: domain
      });

      assert.instanceOf(result, XHR);
      assert.equal(result.url, domain);
      assert.equal(result.password, password);
      assert.equal(result.user, user);
    });

    test('url without domain', function() {
      var request = subject.request({
        url: 'bar.json'
      });

      // we add slash
      assert.equal(request.url, domain + '/bar.json');
    });

  });

});
