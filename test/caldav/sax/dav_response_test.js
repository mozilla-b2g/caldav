testSupport.helper('ical');
testSupport.lib('responder');
testSupport.lib('sax');
testSupport.lib('sax/base');
testSupport.lib('sax/calendar_data_handler');
testSupport.lib('sax/dav_response');

suite('caldav/sax/dav_response', function() {

  var Parse;
  var Response;
  var Base;
  var CalendarDataHandler;

  var originalHandler;

  suiteSetup(function() {
    Parse = Caldav.require('sax');
    Base = Caldav.require('sax/base');
    Response = Caldav.require('sax/dav_response');
  });

  var subject;
  var data;
  var handler;
  var parser;

  setup(function() {
    //we omit the option to pass base parser
    //because we are the base parser
    subject = new Parse();
    subject.registerHandler('DAV:/response', Response);

    // HACK to get CalendarDataHandler
    var handleNS = 'urn:ietf:params:xml:ns:caldav/calendar-data';

    CalendarDataHandler = subject.handles['DAV:/response'];
    CalendarDataHandler = CalendarDataHandler.handles['DAV:/propstat'];
    CalendarDataHandler = CalendarDataHandler.handles[handleNS];

    if (!originalHandler) {
      originalHandler = CalendarDataHandler.parseICAL;
    }

    // XXX: this may change later if ICAL is no longer
    //      exposed directly.
    CalendarDataHandler.parseICAL = ICAL.parse;
  });

  teardown(function() {
    CalendarDataHandler.parseICAL = originalHandler;
  });

  suite('calendar-query', function() {
    var xml;

    testSupport.defineSample('xml/calendar_query_single.xml', function(data) {
      xml = data;
    });

    test('result', function(done) {
      subject.once('complete', function(data) {
        var response = data.multistatus;
        var event = response['event.ics'];
        assert.ok(event);

        assert.ok(event['calendar-data'].value.name, 'name');
        assert.ok(event['calendar-data'].value.value, 'value');
        done();
      });

      subject.write(xml).close();
    });
  });

  suite('propget', function() {
    var xml;

    testSupport.defineSample('xml/propget.xml', function(data) {
      xml = data;
    });

    expected = {
      '/calendar/user/': {

        'principal-URL': {
          status: '200',
          value: {
            href: '/calendar/pinc/'
          }
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
      var response = [];

      subject.on('DAV:/response', function(url, data) {
        response.push([url, data]);
      });


      subject.once('complete', function(data) {
        assert.deepEqual(
          data.multistatus, expected,
          "expected \n '" + JSON.stringify(data.multistatus) +
          "'\n to equal \n '" + JSON.stringify(expected) + '\n"'
        );

        assert.deepEqual(
          [
            '/calendar/user/',
            expected['/calendar/user/']
          ],
          response[0],
          '/calendar/user/ response'
        );

        assert.deepEqual(
          [
            '/calendar/other',
            expected['/calendar/other']
          ],
          response[1],
          '/calendar/other/ response'
        );

        done();
      });
      subject.write(xml).close();
    });
  });

});
