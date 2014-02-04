(function(module, ns) {

  var Caldav = ns.require('caldav'),
      XHR = ns.require('xhr');

  /**
   * Connection objects contain
   * general information to be reused
   * across XHR requests.
   *
   * Also handles normalization of path details.
   */
  function Connection(options) {
    if (typeof(options) === 'undefined') {
      options = {};
    }

    var key;

    for (key in options) {
      if (Object.hasOwnProperty.call(options, key)) {
        this[key] = options[key];
      }
    }

    var domain = options.domain;

    if (domain) {
      if (domain.substr(-1) === '/') {
        this.domain = domain.substr(0, domain.length - 1);
      }
    }

    var httpHandler = this.httpHandler || 'basic_auth';
    if (typeof(httpHandler) !== 'object') {
      this.httpHandler = Caldav.require('http/' + httpHandler);
    }
  }

  Connection.prototype = {
    /**
     * Default username for requests.
     */
    user: '',

    /**
     * Default passwords for requests.
     */
    password: '',

    /**
     * Default domain for requests.
     */
    domain: '',

    /**
     * Creates new XHR request based on default
     * options for connection.
     *
     * @return {Caldav.Xhr} http request set with default options.
     */
    request: function(options) {
      if (options) {
        if (options.url && options.url.indexOf('http') !== 0) {
          var url = options.url;
          if (url.substr(0, 1) !== '/') {
            url = '/' + url;
          }
          options.url = this.domain + url;
        }
      }

      return new this.httpHandler(this, options);
    },

    /**
     * Update properties on this connection and trigger a "update" event.
     *
     *
     *    connection.onupdate = function() {
     *      // do stuff
     *    };
     *
     *    connection.update({
     *      user: 'foobar'
     *    });
     *
     *
     * @param {Object} newProperties to shallow copy onto connection.
     */
    update: function(newProperties) {
      if (newProperties) {
        for (var key in newProperties) {
          if (Object.prototype.hasOwnProperty.call(newProperties, key)) {
            this[key] = newProperties[key];
          }
        }
      }

      if (this.onupdate) {
        this.onupdate();
      }

      return this;
    },

  };

  module.exports = Connection;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('connection'), Caldav] :
    [module, require('./caldav')]
));
