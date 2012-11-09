(function(module, ns) {

  var Errors = ns.require('request/errors');
  
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
      if (Object.hasOwnProperty.call(options, key)) {
        this[key] = options[key];
      }
    }

    this.connection = connection;
  }

  function findProperty(name, data, single) {
    var url, results = [], prop;

    for (url in data) {
      if (Object.hasOwnProperty.call(data, url)) {
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

    Propfind: ns.require('request/propfind'),

    _findPrincipal: function(url, callback) {
      var find = new this.Propfind(this.connection, {
        url: url
      });

      find.prop('current-user-principal');
      find.prop('principal-URL');

      find.send(function(err, data) {
        var principal;

        if (err) {
          callback(err);
          return;
        }

        principal = findProperty('current-user-principal', data, true);

        if (!principal) {
          principal = findProperty('principal-URL', data, true);
        }
        
        if ('unauthenticated' in principal) {
          callback(new Errors.UnauthenticatedError());          
        } else if (principal.href){
          callback(null, principal.href);
        } else {
          callback(new Errors.CaldavHttpError(404));
        }
     
      });
    },

    _findCalendarHome: function(url, callback) {
      var details = {};
      var find = new this.Propfind(this.connection, {
        url: url
      });

      find.prop(['caldav', 'calendar-home-set']);

      find.send(function(err, data) {
        if (err) {
          callback(err);
          return;
        }

        details = {
          url: findProperty('calendar-home-set', data, true)
        };

        callback(null, details);
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
      self._findPrincipal(self.url, function(err, url) {

        if (!url) {
          callback(err);
          return;
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
