testSupport.lib('template');
testSupport.lib('query_builder');

suite('caldav/query_builder', function() {

  // classes
  var Builder;
  var Template;

  // instances
  var subject;
  var template;

  suiteSetup(function() {
    Builder = Caldav.require('query_builder');
    Template = Caldav.require('template');
  });

  setup(function() {
    template = new Template('container');
  });

  test('no template given', function() {
    assert.throws(function() {
      new Builder();
    }, TypeError);
  });

  test('empty document', function() {
    var subject = new Builder({ template: template });
    var out = subject.toString();

    assert.equal(out, '<N0:calendar-data />');
  });

  test('#setRecurrenceSetLimit', function() {
    var subject = new Builder({ template: template });

    subject.setRecurrenceSetLimit({
      start: 'a',
      end: 'b'
    });

    var expected = [
      '<N0:calendar-data>',
        '<N0:limit-recurrence-set start="a" end="b" />',
      '</N0:calendar-data>'
    ].join('');

    var out = subject.toString();
    assert.equal(out, expected);
  });

  // based on (calendar-data):
  // http://pretty-rfc.herokuapp.com/RFC4791#example-partial-retrieval-of-events-by-time-range
  suite('spec test - calendar data', function() {
    var expected = [
      '<N0:calendar-data>',
        '<N0:comp name="VCALENDAR">',
          '<N0:prop name="VERSION" />',
          '<N0:comp name="VTIMEZONE" />',
          '<N0:comp name="VEVENT">',
            '<N0:prop name="SUMMARY" />',
            '<N0:prop name="UID" />',
            '<N0:prop name="DTSTART" />',
            '<N0:prop name="DTEND" />',
            '<N0:prop name="DURATION" />',
            '<N0:prop name="RRULE" />',
            '<N0:prop name="RDATE" />',
            '<N0:prop name="EXRULE" />',
            '<N0:prop name="EXDATE" />',
            '<N0:prop name="RECURRENCE-ID" />',
          '</N0:comp>',
        '</N0:comp>',
      '</N0:calendar-data>'
    ].join('');

    test('output', function() {
      var builder = new Builder({
        template: template,
        tag: ['caldav', 'calendar-data'],
        compTag: ['caldav', 'comp'],
        propTag: ['caldav', 'prop']
      });

      // set the root component
      var cal = builder.setComp('VCALENDAR');
      cal.prop('VERSION');

      // vtimezone
      cal.comp('VTIMEZONE');

      // vevent
      var event = cal.comp('VEVENT');

      //shortcut method
      event.prop([
        'SUMMARY',
        'UID',
        'DTSTART',
        'DTEND',
        'DURATION',
        'RRULE',
        'RDATE',
        'EXRULE',
        'EXDATE',
        'RECURRENCE-ID'
      ]);

      var output = builder.toString();
      assert.deepEqual(
        output.trim(),
        expected.trim()
      );
    });
  });

  // based on (calendar-filter):
  // http://pretty-rfc.herokuapp.com/RFC4791#example-partial-retrieval-of-events-by-time-range
  suite('spec test - filter', function() {
    var expected = [
      '<N0:filter>',
        '<N0:comp-filter name="VCALENDAR">',
          '<N0:comp-filter name="VEVENT">',
            '<N0:time-range start="20060104T000000Z" ',
                          'end="20060105T000000Z" />',
          '</N0:comp-filter>',
        '</N0:comp-filter>',
      '</N0:filter>'
    ].join('');

    test('output', function() {
      var filter = new Builder({
        tag: ['caldav', 'filter'],
        compTag: ['caldav', 'comp-filter'],
        propTag: ['caldav', 'prop-filter'],
        template: template
      });

      var event = filter.setComp('VCALENDAR').
                         comp('VEVENT');

      event.setTimeRange({
        start: '20060104T000000Z',
        end: '20060105T000000Z'
      });

      var output = filter.toString();
      assert.equal(expected, output);
    });

  });
});
