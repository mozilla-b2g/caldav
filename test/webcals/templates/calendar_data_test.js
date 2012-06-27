requireRequest();
testSupport.requireLib('templates/calendar_data');

suite('webcals/templates/calendar_data', function() {
  var CalendarData;
  var Template;

  var subject;
  var template;

  function select() {
    subject.select('VTODO', ['DTIME']);
    subject.select('VTODO', ['NAME', { VTIMEZONE: true }]);
    subject.select('VEVENT', ['NAME', {
      'VALARM': ['NAME']
    }]);
  }

  suiteSetup(function() {
    CalendarData = Webcals.require('templates/calendar_data');
    Template = Webcals.require('template');
  });

  setup(function() {
    subject = new CalendarData();
    template = new Template('root');
  });

  test('initialization', function() {
    assert.deepEqual(subject.struct, {});
  });

  suite('#render', function() {
    var output;
    var expected;

    expected = [
      '<N0:calendar-data>',
        '<N0:comp name="VCALENDAR">',
          '<N0:comp name="VTODO">',
            '<N0:prop name="DTIME" />',
            '<N0:prop name="NAME" />',
            '<N0:comp name="VTIMEZONE" />',
          '</N0:comp>',
          '<N0:comp name="VEVENT">',
            '<N0:prop name="NAME" />',
            '<N0:comp name="VALARM">',
              '<N0:prop name="NAME" />',
            '</N0:comp>',
          '</N0:comp>',
        '</N0:comp>',
      '</N0:calendar-data>'
    ].join('');

    test('without items', function() {
      var output = subject.render(template);
      assert.equal(
        output,
        '<N0:calendar-data />'
      );
    });

    test('output', function() {
      select();
      var output = subject.render(template);
      assert.equal(output, expected);
    });
  });

});
