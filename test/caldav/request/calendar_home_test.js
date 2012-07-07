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

  suite('requests', function() {
    var err, data, response;

    function request(method) {
      subject[method](url, function() {
        err = arguments[0];
        data = arguments[1];
      });

      return MockPropfind.instances[MockPropfind.instances.length - 1];
    }

    setup(function() {
      err = null;
      data = null;
      response = {};
    });

    suite('#_findPrincipal', function() {

      test('with current-user-principal', function() {
        var req = request('_findPrincipal');

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

      test('with principal-URL', function() {
        var req = request('_findPrincipal');

        response[url] = {
          'current-user-principal': {
            status: '404',
            value: {}
          },
          'principal-URL': {
            status: '200',
            value: 'bar.com/'
          }
        };

        req.respond(null, response);

        assert.equal(data, 'bar.com/');
      });
    });

    suite('#_findCalendarHome', function() {
      test('success', function() {
        var req = request('_findCalendarHome');

        assert.equal(req.options.url, url);
        assert.deepEqual(req.propCalls, [
          [['caldav', 'calendar-home-set']]
        ]);

        response[url] = {
          'calendar-home-set': {
            status: '200',
            value: 'bar.com/'
          }
        };

        req.respond(null, response);

        assert.deepEqual(data, {
          url: 'bar.com/'
        });
      });
    });


    suite('#send', function() {

      function mockCallback(obj, method) {
        var calledWith = {};
        var calls = 0;

        obj[method] = function() {
          if (calls.length > 1) {
            throw new Error(method + ' called more then once');
          }

          calledWith.args = arguments;
        };

        return calledWith;
      }

      test('success', function() {
        var expected = { url: 'foo.com' };
        var principal = mockCallback(subject, '_findPrincipal');
        var home = mockCallback(subject, '_findCalendarHome');

        subject.send(function() {
          err = arguments[0];
          data = arguments[1];
        });

        assert.equal(principal.args[0], subject.url);
        principal.args[1](null, 'baz.com');

        assert.equal(home.args[0], 'baz.com');
        home.args[1](null, expected);

        assert.deepEqual(data, {
          url: 'foo.com'
        });
      });
    });

  });

});
