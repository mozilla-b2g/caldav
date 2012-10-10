// taken from mocha
const COLORS = {
  'pass': 90,
  'fail': 31,
  'bright pass': 92,
  'bright fail': 91,
  'bright yellow': 93,
  'pending': 36,
  'suite': 0,
  'error title': 0,
  'error message': 31,
  'error stack': 90,
  'checkmark': 32,
  'fast': 90,
  'medium': 33,
  'slow': 31,
  'green': 32,
  'light': 90,
  'diff gutter': 90,
  'diff added': 42,
  'diff removed': 41
};

function color(type, str) {
  return '\u001b[' + COLORS[type] + 'm' + str + '\u001b[0m';
}

var util = require('util');
var Caldav = require('../../lib/caldav');
var debug = require('debug');

var logs = {
  'normal': debug('caldav:test'),
  'detailed': debug('caldav:test')
};

var Helper = {
  formatObject: function(obj) {
    var format = util.inspect(
      obj,
      false,
      4,
      true
    );

    return format;
  },

  log: function(message, object, level) {
    var log = debug('caldav:test');

    if (!level)
      level = 'normal';

    if (level !== 'normal') {
      log = debug('caldav:test-' + level);
    }

    log(message, Helper.formatObject(object));
  },

  /**
   * Return new caldav connection object.
   * Gets config information from testEnv `serverConfig`.
   *
   * @return {CalDav.Connection} live connection.
   */
  connection: function() {
    var config = testEnv.serverConfig;

    return new Caldav.Connection({
      domain: config.domain,
      user: config.user,
      password: config.password
    });
  },

  findEnvHome: function(done) {
    var config = testEnv.serverConfig;
    var con = Helper.connection();

    var home = new Caldav.Request.CalendarHome(con, {
      url: config.uri
    });

    home.send(function(err, data) {
      if (err) {
        done(err);
        return;
      }
      Helper.log('found home', data);
      testEnv.homeUrl = data.url;
      done();
    });
  }
};

module.exports = Helper;
