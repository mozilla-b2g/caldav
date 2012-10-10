var debug = require('debug')('caldav:test:detailed');
var helper = require('./helper.js');
var Caldav = require('../../lib/caldav');
var assert = require('assert');

suite('resources', function() {

  suiteSetup(function(done) {
    if (!testEnv.homeUrl) {
      helper.findEnvHome(done);
    } else {
      done();
    }
  });

  function checkCalendarCap(url, calendar) {

    function cap(field) {
      var value = calendar[field];

      if (!value && value != 0) {
        helper.log(url + ' missing ' + field, false, 'cap');
      } else {
        helper.log(url + ' ' + field, value, 'cap');
      }
    }

    cap('color');
    cap('ctag');
    cap('privilegeSet');
    cap('name');
    cap('description');
  }

  test('find calendars', function(done) {
    var con = helper.connection();
    var resources = new Caldav.Request.Resources(con, {
      url: testEnv.homeUrl
    });

    resources.addResource('calendar', Caldav.Resources.Calendar);
    resources.prop(['ical', 'calendar-color']);
    resources.prop(['caldav', 'calendar-description']);
    resources.prop(['caldav', 'calendar-timezone']);
    resources.prop('displayname');
    resources.prop('resourcetype');
    resources.prop('getlastmodified');
    resources.prop('current-user-privilege-set');
    resources.prop(['calserver', 'getctag']);

    // found calendar home find calendars.
    resources.send(function(err, data) {
      helper.log('calendars:', data, 'detailed');

      if (!data || !data.calendar) {
        console.log('no calendars - fatal exiting.');
        helper.log('no calendars', err, 'fatal');
        process.exit(0);
      }

      helper.log('found calendars:', Object.keys(data.calendar));

      for (var id in data.calendar) {
        checkCalendarCap(id, data.calendar[id]);
      }

      done();
    });
  });

});
