(function(module, ns) {

  var XHR = ns.require('xhr');
  var QueryString = ns.require('querystring');
  var Connection = ns.require('connection');
  var OAuth = ns.require('oauth2');

  /**
   * Creates an XHR like object given a connection and a set of options
   * (passed directly to the superclass)
   *
   * @param {Caldav.Connection} connection used for apiCredentials.
   * @param {Object} options typical XHR options.
   */
  function Oauth2(connection, options) {
    if (
      !connection ||
      !connection.oauth ||
      (
        !connection.oauth.code &&
        !connection.oauth.refresh_token
      )
    ) {
      throw new Error('connection .oauth must have code or refresh_token');
    }

    this.connection = connection;

    this.oauth =
      new OAuth(connection.apiCredentials);

    // create a clone of options
    var clone = Object.create(null);

    if (typeof(options) !== 'undefined') {
      for (var key in options) {
        clone[key] = options[key];
      }
    }

    XHR.call(this, clone);
  }

  Oauth2.prototype = {
    __proto__: XHR.prototype,

    _sendXHR: function(xhr) {
      xhr.setRequestHeader(
        'Authorization', 'Bearer ' + this.connection.oauth.access_token
      );

      xhr.send(this._serialize());
      return xhr;
    },

    _updateConnection: function(credentials) {
      var oauth = this.connection.oauth;
      var update = { oauth: credentials };

      if (oauth.refresh_token && !credentials.refresh_token)
        credentials.refresh_token = oauth.refresh_token;

      if (credentials.user) {
        update.user = credentials.user;
        delete credentials.user;
      }

      return this.connection.update(update);
    },

    send: function(callback) {
      var xhr = this._buildXHR(callback);
      var oauth = this.connection.oauth;

      // everything is fine just send
      if (this.oauth.accessTokenValid(oauth)) {
        return this._sendXHR(xhr);
      }

      var handleTokenUpdates = (function handleTokenUpdates(err, credentials) {
        if (err) {
          return callback(err);
        }
        this._updateConnection(credentials);
        return this._sendXHR(xhr);
      }.bind(this));

      if (oauth.code) {
        this.oauth.authenticateCode(oauth.code, handleTokenUpdates);

        // it should be impossible to have both code and refresh_token
        // but we return as a guard
        return xhr;
      }

      if (oauth.refresh_token) {
        this.oauth.refreshToken(oauth.refresh_token, handleTokenUpdates);
        return xhr;
      }
    }

  };


  module.exports = Oauth2;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('http/oauth2'), Caldav] :
    [module, require('../caldav')]
));


