var debug = require('debug')('caldav:test:detailed');
var helper = require('./helper.js');
var Caldav = require('../../lib/caldav');
var assert = require('assert');
require('../support/ical.js');

suite('query', function() {
  var calendars;
  var con;

  suiteSetup(function(done) {
    if (!testEnv.homeUrl) {
      helper.findEnvHome(done);
    } else {
      done();
    }
  });

  suiteSetup(function(done) {
    con = helper.connection();
    var resources = new Caldav.Request.Resources(con, {
      url: testEnv.homeUrl
    });

    resources.addResource('calendar', Caldav.Resources.Calendar);
    resources.prop('displayname');
    resources.prop('resourcetype');

    // found calendar home find calendars.
    resources.send(function(err, data) {
      helper.log('calendars:', data, 'detailed');
      helper.log('found calendars:', Object.keys(data.calendar));

      calendars = data.calendar;

      if (Object.keys(calendars).length < 1) {
        console.error('No calendars');
        helper.log('no calendars', true, 'fatal');
        process.exit(0);
      }

      done();
    });
  });

  function parseString(ical, callback) {
    var event;
    var exceptions = [];
    var primary;
    var build = new ICAL.ComponentParser();

    //build.onevent = function() {
    //}

    //build.oncomplete = function() {
      //callback(primary);
    //}
  }

  test('limit query', function(done) {
    var keys = Object.keys(calendars);
    var cal = calendars[keys[0]];
    var query = cal.createQuery();

    var comp = query.filter.setComp('VCALENDAR').
                            comp('VEVENT');


    comp.setTimeRange({
      start: '20121001T000000Z',
      end: '20131001T000000Z'
    });

    query.prop('getetag');

    var comp = query.data.setComp('VCALENDAR');
    var event = comp.comp('VEVENT');

    event.prop([
      'DTSTART',
      'DTEND',
      'SUMMARY',
      'DESCRIPTION'
    ]);

    query.send(function(err, data) {
      var list = [];

      for (var key in data) {
        list.push({
          url: key,
          ical: data[key]['calendar-data'].value
        });
      }


      list.forEach(function(item) {
        console.log(item.url, item.ical);
      });

      done();
    });
  });

});
