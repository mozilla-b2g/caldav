require('/lib/ical.js');

suite('caldav/ics', function() {

  var ical;
  var samples = {};

  suiteSetup(function(done) {
    testSupport.loadSample('ical/event.ics', function(err, data) {
      samples.event = data;
      done();
    });
  });

  test('intiailizer', function() {
    assert.ok(ICAL);
  });

  suite('VEVENT', function() {
    var result;

    setup(function() {
      result = ICAL.parse(samples.event);
    });

    test('parse', function() {
      assert.equal(result.name, 'VCALENDAR');
    });

  });

});
