requireLib('sax');
requireLib('sax/base');
requireLib('sax/dav_response');

suite('webcals/sax/base', function() {

  var data,
      subject,
      parser,
      Parse,
      Response,
      Base,
      handler;


  suiteSetup(function() {
    Parse = Webcals.require('sax');
    Base = Webcals.require('sax/base');
    Response = Webcals.require('sax/dav_response');
  });

  setup(function() {
    //we omit the option to pass base parser
    //because we are the base parser
    subject = new Parse();
    subject.registerHandler('DAV:/response', Response);
  });

  suite('parsing', function() {
    var xml;

    defineSample('xml/propget.xml', function(data) {
      xml = data;
    });

    expected = {
      '/calendar/user/': {

        'principal-URL': {
          status: '200',
          value: '/calendar/pinc/'
        },

        resourcetype: {
          status: '200',
          value: [
            'principal',
            'collection'
          ]
        },

        'current-user-principal': {
          status: '404',
          value: {}
        }
      },

      '/calendar/other': {
        missing: {
          status: '200',
          value: {}
        }
      }
    };

    test('output', function(done) {
      subject.once('complete', function(data) {
        console.log(JSON.stringify(data.multistatus));
        assert.deepEqual(
          data.multistatus, expected,
          "expected \n '" + JSON.stringify(data.multistatus) +
          "'\n to equal \n '" + JSON.stringify(expected) + '\n"'
        );
        done();
      });
      subject.write(xml).close();
    });
  });

});
