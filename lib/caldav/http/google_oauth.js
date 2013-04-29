(function(module, ns) {

  var XHR = ns.require('xhr');
  var QueryString = ns.require('querystring');
  var Connection = ns.require('connection');

  var AUTHENTICATION_SERVER_URL =
    'https://accounts.google.com/o/oauth2/token';

  function postToAuthenticationServer(requestData, callback) {
    var xhr = new XHR({
      url: AUTHENTICATION_SERVER_URL,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: QueryString.stringify(requestData),
      method: 'POST'
    });

    return xhr.send(callback);
  }

  function formatAuthServerResponse(resp) {
    resp = JSON.parse(resp);

    // replace the oauth details
    if (resp.expires_in) {
      // convert to ms
      resp.utc_expiry_time =
        Date.now() + (parseInt(resp.expires_in, 10) * 1000);
    }

    return resp;
  }

  function hasCredentials(realFunc) {
    return function() {
      if (!this.connection.apiCredentials) {
        throw new Error('apiCredentials must be available on connection');
      }

      var fields = [
        'client_secret',
        'client_id',
        'redirect_uri'
      ];

      fields.forEach(function(type) {
        if (!(type in this.connection.apiCredentials)) {
          throw new Error('.apiCredentials.' + type + ' : must be available.');
        }
      }, this);

      return realFunc.apply(this, arguments);
    };
  }

  function GoogleOauth(connection, options) {
    this.connection = connection;

    // create a clone of options
    var clone = Object.create(null);

    if (typeof(options) !== 'undefined') {
      for (var key in options) {
        clone[key] = options[key];
      }
    }

    XHR.call(this, clone);
  }

  GoogleOauth.requiresIntialAuth = true;

  GoogleOauth.prototype = {
    __proto__: XHR.prototype,

    /**
     * Given a code from the user sign in flow get the refresh token &
     * access_token.
     */
    _authenticateCode: hasCredentials(function(callback) {
      // connection should have the .code under oAuth.
      var oauth = this.connection.oauth;
      var apiCreds = this.connection.apiCredentials;


      if (!oauth) {
        return setTimeout(function() {
          callback(new Error('oauth must be on the connection'));
        });
      }

      if (!oauth.code) {
        return setTimeout(function() {
          callback(new Error('oauth.code must be given'));
        });
      }

      var self = this;
      function handleResponse(err, xhr) {
        if (err) {
          return callback(err);
        }

        try {
          self.connection.update({
            oauth: formatAuthServerResponse(xhr.responseText)
          });
          // we create a new connection based on the oauth response.
          callback(null);
        } catch (e) {
          callback(e);
        }
      }

      return postToAuthenticationServer(
        {
          code: oauth.code,
          client_id: apiCreds.client_id,
          client_secret: apiCreds.client_secret,
          redirect_uri: apiCreds.redirect_uri,
          grant_type: 'authorization_code'
        },
        handleResponse
      );
    }),

    /**
     * Refresh api keys and tokens related to those keys.
     */
    _refreshTokens: hasCredentials(function() {
    })
  };


  module.exports = GoogleOauth;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('http/google_oauth'), Caldav] :
    [module, require('../caldav')]
));


