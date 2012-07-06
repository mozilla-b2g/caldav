requireRequest();
testSupport.lib('templates/calendar_data');
testSupport.lib('templates/calendar_filter');

suite('caldav/templates/calendar_filter', function() {
  var CalendarFilter;
  var Template;

  var subject;
  var template;

  function filter() {
    subject.add('VEVENT', true);
  }

  suiteSetup(function() {
    CalendarFilter = Caldav.require('templates/calendar_filter');
    Template = Caldav.require('template');
  });

  setup(function() {
    subject = new CalendarFilter();
    template = new Template('root');
  });

  test('initialization', function() {
    assert.deepEqual(subject.struct, {});
  });

  suite('#render', function() {
    var output;
    var expected;

    expected = [
      '<N0:filter>',
        '<N0:comp-filter name="VCALENDAR">',
          '<N0:comp-filter name="VEVENT" />',
        '</N0:comp-filter>',
      '</N0:filter>'
    ].join('');

    setup(function() {
      filter();
    });

    test('output', function() {
      var output = subject.render(template);
      assert.equal(output, expected);
    });
  });

});

