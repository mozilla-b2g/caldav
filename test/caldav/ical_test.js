testSupport.lib('ical'),

suite('caldav/ics', function() {

  var ical;

  suiteSetup(function() {
    console.log(Caldav);
    ical = Caldav.require('ical');
  });

  test('intiailizer', function() {
    assert.ok(ical);
  });

});
