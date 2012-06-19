var fs = require('fs'),
    ics = requireLib('ics'),
    data = fs.readFileSync(__dirname + '/../../data/test.data', 'utf8');

suite('webcals/ics', function() {

  test('intiailizer', function() {
    assert.ok(ics);
  });

});
