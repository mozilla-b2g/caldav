suite('webcals/sax/propstat', function() {
  var stat = requireLib('sax/propstat'),
      sax = requireLib('sax'),
      subject;

  var expected = {
    status: 200,
    'principal-URL': '/calendar/dav/calmozilla1@gmail.com/user/',
    'resource-type': [
      'principal',
      'collection'
    ]
  };

  test('propstat success', function(done) {
    var parser = sax();

    console.log(parser.on);
    stat(parser, function(err, result) {
      console.log(result);
      done();
    });

    parser.write(loadSample('xml/propstat-success.xml')).close();
  });

});
