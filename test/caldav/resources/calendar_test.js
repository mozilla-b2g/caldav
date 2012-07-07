testSupport.lib('resources/calendar'),
testSupport.lib('xhr');
testSupport.lib('connection');

suite('caldav/resources/calendar', function() {

  var Calendar;
  var Connection;
  var con;
  var url = 'foobar.com';
  var subject;

  suiteSetup(function() {
    Calendar = Caldav.require('resources/calendar');
    Connection = Caldav.require('connection');
  });

  setup(function() {
    con = new Connection();
    subject = new Calendar(con, {
      url: url
    });
  });

  suite('initialization', function() {

    test('without calendar data', function() {
      assert.equal(subject.url, url);
    });

    test('with calendar data', function() {
      return;
      var calledWith, data = { value: 'wow'};
      subject.updateFromServer = function() {
        calledWith = arguments;
      }

      subject.constructor.call(this, con, data);

      assert.equal(calledWith[0], data);
    });

  });

  suite('#updateFromServer', function() {

    function status(value, status) {
      if (typeof(status) === 'undefined') {
        status = '200';
      }

      return { status: status, value: value };
    }

    var input = {
      displayname: status('name'),
      'calendar-color': status('#FFF'),
      'calendar-description': status('desc'),
      'getctag': status('17'),
      'resourcetype': status(['calendar']),
      'current-user-privilege-set': status(null, 404)
    };

    var expected = {
      name: 'name',
      color: '#FFF',
      description: 'desc',
      ctag: '17',
      resourcetype: ['calendar'],
      privilegeSet: []
    };

    test('full set', function() {
      var key;
      subject.updateFromServer(input);

      for (key in expected) {
        if (expected.hasOwnProperty(key)) {
          assert.deepEqual(
            subject[key], expected[key],
            key + ' was not set'
          );
        }
      }
    });

    test('partial update', function() {
      subject.updateFromServer(input);
      subject.updateFromServer({
        'calendar-description': status('baz')
      });

      assert.equal(subject.color, '#FFF', 'should not clear old values');
      assert.equal(subject.description, 'baz');
    });

  });



});
