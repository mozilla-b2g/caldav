testSupport.lib('ical'),

suite('webcals/ics', function() {

  var ical;

  suiteSetup(function() {
    console.log(Webcals);
    ical = Webcals.require('ical');
  });

  test('intiailizer', function() {
    assert.ok(ical);
  });

});
