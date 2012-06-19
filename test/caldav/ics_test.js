var fs = require('fs'),
    ics = requireLib('ics'),
    data = fs.readFileSync(__dirname + '/../../data/test.data', 'utf8');

suite('caldav/ics', function() {

  test('intiailizer', function() {
    ics(data, function(data) {
      console.log(data.vevent[0]);
    }, function() {
      console.log('y');
    })
  });

});
