(function(module, ns) {

  var XHR = ns.require('xhr');

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
      if (typeof(options) === 'undefined') {
        options = {};
      }

      var copy = {};
      var key;
      // copy options

      for (key in options) {
        copy[key] = options[key];
      }

      if (!copy.user) {
        copy.user = this.user;
      }

      if (!copy.password) {
        copy.password = this.password;
      }

      if (copy.url && copy.url.indexOf('http') !== 0) {
        var url = copy.url;
        if (url.substr(0, 1) !== '/') {
          url = '/' + url;
        }
        copy.url = this.domain + url;
      }

      return new XHR(copy);
    }

  };

  module.exports = Connection;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('connection'), Caldav] :
    [module, require('./caldav')]
));
