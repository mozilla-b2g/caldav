requireRequest();
testSupport.lib('request/propfind');
testSupport.lib('request/resources');
testSupport.helper('mock_request');

suite('caldav/resource_finder', function() {

  var Connection;
  var MockRequest;
  var MockPropfind;
  var Propfind;
  var Finder;
  var subject;
  var con;

  var url = 'http://google.com',
      subject;

  suiteSetup(function() {
    Connection = Caldav.require('connection');
    Finder = Caldav.require('request/resources');
    Propfind = Caldav.require('request/propfind');
    MockRequest = Caldav.require('support/mock_request');
  });

  suiteSetup(function() {
    MockPropfind = MockRequest.create(['prop']);
  });

  setup(function() {
    MockPropfind.reset();

    con = new Connection();
    subject = new Finder(con, {
      url: url,
      Propfind: MockPropfind
    });

  });

  test('initializer', function() {
    assert.equal(subject.url, url);
    assert.equal(subject.connection, con);
    assert.deepEqual(subject._resources, {});
    assert.instanceOf(subject, Propfind);
    assert.equal(subject.depth, 1);
  });

  test('#addResource', function() {
    var fn = function() {};

    subject.addResource('foo', fn);

    assert.equal(subject._resources['foo'], fn);
  });

  suite('#_processResult', function() {

    var Handler = function() {
      this.args = arguments;
    };

    function status(value, status) {
      if (typeof(status) === 'undefined') {
        status = '200';
      }

      return { value: value, status: status };
    }

    function resource(name, type) {
      return {
        name: status(name),
        resourcetype: status([type])
      };
    }

    setup(function() {
      subject.addResource('calendar', Handler);
    });

    test('handled & unhandled resource', function() {
      var result;
      var input = {
        'a': resource('1', 'calendar'),
        'b': resource('2', 'other')
      };

      subject.sax.root = { multistatus: input };
      subject._processResult(null, function(err, data) {
        result = data;
      });

      assert.ok(result.calendar['a']);
      assert.instanceOf(result.calendar['a'], Handler);
      assert.equal(Object.keys(result.calendar).length, 1);

      assert.equal(result.calendar['a'].args[1].name.value, '1');
    });

  });

});
