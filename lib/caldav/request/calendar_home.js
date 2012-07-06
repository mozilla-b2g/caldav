(function(module, ns) {

  var Propfind = ns.require('request/propfind');


  /**
   * Creates a propfind request.
   *
   * @param {Caldav.Connection} connection connection details.
   * @param {Object} options options for propfind.
   */
  function CalendarHome(connection, options) {
    var key;

    if (typeof(options) === 'undefined') {
      options = {};
    }

    for (key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }

    this.connection = connection;
  }

  function findProperty(name, data, single) {
    var url, results = [], prop;

    for (url in data) {
      if (data.hasOwnProperty(url)) {
        if (name in data[url]) {
          prop = data[url][name];
          if (prop.status === '200') {
            results.push(data[url][name].value);
          }
        }
      }
    }

    if (!results.length)
      return false;

    if (typeof(single) !== 'undefined' && single) {
      return results[0];
    }

    return results;
  }

  CalendarHome.prototype = {

    _findPrincipal: function(url, callback) {
      var find = new Propfind(this.connection, {
        url: url
      });

      find.prop('current-user-principal');
      find.prop('principal-URL');

      find.send(function(err, data) {
        var principal;

        if (err) {
          return callback(err);
        }

        principal = findProperty('current-user-principal', data, true);

        if (!principal) {
          principal = findProperty('principal-URL', data, true);
        }

        callback(null, principal);
      });
    },

    _findCalendarHome: function(url, callback) {
      var find = new Propfind(this.connection, {
        url: url
      });

      find.prop(['caldav', 'calendar-home-set']);

      find.send(function(err, data) {
        if (err) {
          return callback(err);
        }

        callback(null, findProperty('calendar-home-set', data, true));
      });
    },

    /**
     * Starts request to find calendar home url
     *
     * @param {Function} callback node style where second argument
     *                            are the details of the home calendar.
     */
    send: function(callback) {
      var self = this;
      // find principal
      self._findPrincipal(self.url, function(err, url) {

        if (!url) {
          return callback(new Error('Cannot resolve principal url'));
        }

        self._findCalendarHome(url, function(err, details) {
          callback(err, details);
        });
      });
    }

  };

  module.exports = CalendarHome;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/calendar_home'), Caldav] :
    [module, require('../caldav')]
));
