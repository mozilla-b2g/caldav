testSupport.requireLib('ical'),

suite('webcals/ics', function() {

  var ical;

  suiteSetup(function() {
    ical = Webcals.require('ical');
  });

  test('intiailizer', function() {
    assert.ok(ical);
  });

});
