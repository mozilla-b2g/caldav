testSupport.lib('ical'),

suite('caldav/ics', function() {

  var ical;
  var samples = {};

  suiteSetup(function(done) {
    testSupport.loadSample('ical/event.ics', function(err, data) {
      samples.event = data;
      done();
    });
  });

  suiteSetup(function() {
    ical = Caldav.require('ical');
  });

  test('intiailizer', function() {
    assert.ok(ical);
  });

  suite('VEVENT', function() {
    var result;

    setup(function() {
      result = ical(samples.event);
    });

    test('parse', function() {
      assert.ok(result.vevent);
    });

  });

});
