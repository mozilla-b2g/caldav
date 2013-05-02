(function(module, ns) {

  var XHR = ns.require('xhr');
  var QueryString = ns.require('querystring');

  var REQUIRED_CREDENTIALS = [
    'client_secret',
    'client_id',
    'redirect_uri',
    'url'
  ];

  /**
   * Given a string (directly from xhr.responseText usually) format and create
   * an oauth authorization server response.
   *
   * @param {String} resp raw response from http server.
   * @return {Object} formatted version of response.
   */
  function formatResponse(resp) {
    resp = JSON.parse(resp);

    // replace the oauth details
    if (resp.access_token) {
      resp.issued_at = Date.now();
    }

    return resp;
  }

  /**
   * Sends XHR object's request and handles common JSON parsing issues.
   */
  function sendRequest(xhr, callback) {
    return xhr.send(function(err, request) {
      if (err) {
        return callback(err);
      }

      var result;
      try {
        result = formatResponse(request.responseText);
      } catch (e) {
        err = e;
      }

      callback(err, result, request);
    });
  }

  /**
   * Private helper for issuing a POST http request the given endpoint.
   * The body of the HTTP request is a x-www-form-urlencoded request.
   *
   *
   * @param {String} url endpoint of server.
   * @param {Object} requestData object representation of form data.
   */
  function post(url, requestData, callback) {
    var xhr = new XHR({
      url: url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: QueryString.stringify(requestData),
      method: 'POST',
      streaming: false
    });

    return sendRequest(xhr, callback);
  }

  /**
   * Creates an OAuth authentication handler. The logic here is designed to
   * handle the cases after the user initially authenticates and we either have
   * a "code" or "refresh_token".
   *
   *
   *    var oauthClient = new OAuth(
   *      {
   *        url: 'https://accounts.google.com/o/oauth2/token',
   *        client_secret: '',
   *        client_id: '',
   *        redirect_uri: '',
   *        // optional user_info option
   *        user_info: {
   *          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
   *          field: 'email'
   *        }
   *      }
   *    );
   *
   */
  function OAuth(credentials) {
    this.apiCredentials = {};

    for (var key in credentials) {
      this.apiCredentials[key] = credentials[key];
    }

    REQUIRED_CREDENTIALS.forEach(function(type) {
      if (!(type in this.apiCredentials)) {
        throw new Error('.apiCredentials.' + type + ' : must be available.');
      }
    }, this);
  }

  OAuth.prototype = {

    /**
     * Basic API credentials for oauth operations.
     *
     * Required properties:
     *
     *    - url
     *    - client_id
     *    - client_secret
     *    - redirect_uri
     *
     * @type {Object}
     */
    apiCredentials: null,

    /**
     * Private helper for requesting user info... Unlike other methods this
     * is unrelated to core rfc6749 functionality.
     *
     * NOTE: Really brittle as it will not refresh tokens must be called
     * directly after authorization with a fresh access_token.
     *
     *
     * @param {Object} oauth result of a previous oauth response
     *  (must contain valid access_token).
     *
     * @param {Function} callback called with [err, userProperty].
     */
    _requestUserInfo: function(oauth, callback) {
      var apiCredentials = this.apiCredentials;
      var url = apiCredentials.user_info.url;
      var field = apiCredentials.user_info.field;
      var authorization = oauth.token_type + ' ' + oauth.access_token;

      var xhr = new XHR({
        headers: {
          Authorization: authorization
        },
        url: url,
        streaming: false
      });

      sendRequest(xhr, function(err, json) {
        if (err) {
          return callback(err);
        }

        /* json is an object so this should not explode */
        callback(err, json[field]);
      });
    },

    /**
     * Given a code from the user sign in flow get the refresh token &
     * access_token.
     */
    authenticateCode: function(code, callback) {
      var apiCredentials = this.apiCredentials;

      if (!code) {
        return setTimeout(function() {
          callback(new Error('code must be given'));
        });
      }

      var self = this;
      function handleResponse(err, result) {
        if (err) {
          return callback(err);
        }

        if (!apiCredentials.user_info) {
          return callback(null, result);
        }

        // attempt fetching user details
        self._requestUserInfo(result, function(err, user) {
          if (err) {
            return callback(err);
          }
          result.user = user;
          callback(null, result);
        });
      }

      return post(
        apiCredentials.url,
        {
          code: code,
          client_id: apiCredentials.client_id,
          client_secret: apiCredentials.client_secret,
          redirect_uri: apiCredentials.redirect_uri,
          grant_type: 'authorization_code'
        },
        handleResponse
      );
    },

    /**
     * Refresh api keys and tokens related to those keys.
     *
     * @param {String} refreshToken token for refreshing oauth credentials
     *   (refresh_token per rfc6749).
     */
    refreshToken: function(refreshToken, callback) {
      var apiCredentials = this.apiCredentials;

      if (!refreshToken) {
        throw new Error('invalid refresh token given: "' + refreshToken + '"');
      }

      return post(
        apiCredentials.url,
        {
          refresh_token: refreshToken,
          client_id: apiCredentials.client_id,
          client_secret: apiCredentials.client_secret,
          grant_type: 'refresh_token'
        },
        callback
      );
    },

    /**
     * Soft verification of tokens... Ensures access_token is available and is
     * not expired.
     *
     * @param {Object} oauth details.
     * @return {Boolean} true when looks valid.
     */
    accessTokenValid: function(oauth) {
      return !!(
        oauth &&
        oauth.access_token &&
        oauth.expires_in &&
        oauth.issued_at &&
        (Date.now() < (oauth.issued_at + oauth.expires_in))
      );
    }

  };


  module.exports = OAuth;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('oauth2'), Caldav] :
    [module, require('./caldav')]
));



