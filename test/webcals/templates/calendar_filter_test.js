requireRequest();
requireLib('templates/calendar_data');

suite('webcals/templates/calendar_data', function() {
  var CalendarFilter;
  var Template;

  var subject;
  var template;

  function filter() {
    subject.filter('VEVENT', true);
  }

  suiteSetup(function() {
    CalendarFilter = Webcals.require('templates/calendar_filter');
    Template = Webcals.require('template');
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
      console.log();
      console.log(output)
      console.log();
      assert.equal(output, expected);
    });
  });

});

