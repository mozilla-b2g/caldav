(function(module, ns) {

  var SAX = ns.require('sax');
  var XHR = ns.require('xhr');
  var Errors = ns.require('errors');

  function determineHttpStatusError(status) {
    var message = 'Cannot handle request due to server response';
    var err = 'Unknown';

    if (status === 500)
      err = 'ServerFailure';

    if (status === 401)
      err = 'Authentication';

    return new Errors[err](message);
  }

  /**
   * Creates an (Web/Cal)Dav request.
   *
   * @param {Caldav.Connection} connection connection details.
   * @param {Object} options additional options for request.
   */
  function Abstract(connection, options) {
    if (typeof(options) === 'undefined') {
      options = {};
    }

    var key;
    var xhrOptions = {};

    this.sax = new SAX();

    for (key in options) {
      if (Object.hasOwnProperty.call(options, key)) {
        this[key] = options[key];
      }
    }

    if (!connection) {
      throw new Error('must pass connection object');
    }

    this.connection = connection;

    this.xhr = this.connection.request({
      url: this.url,
      headers: { 'Content-Type': 'text/xml' }
    });
  }

  Abstract.prototype = {

    _createPayload: function() {
      return '';
    },

    _processResult: function(req, callback) {
      callback.call(this, null, this.sax.root, req);
    },

    /**
     * Sends request to server.
     *
     * @param {Function} callback node style callback.
     *                            Receives three arguments
     *                            error, parsedData, xhr.
     * @return {Caldav.Xhr} The xhr request so that the caller
     *                      has a chance to abort the request.
     */
    send: function(callback) {
      var self = this;
      var req = this.xhr;
      req.data = this._createPayload();

      req.ondata = function xhrOnData(chunk) {
        self.sax.write(chunk);
      };

      // in the future we may stream data somehow
      req.send(function xhrResult(err, xhr) {
        if (err) {
          return callback(err);
        }

        // handle the success case
        if (xhr.status > 199 && xhr.status < 300) {
          self.sax.close();
          return self._processResult(req, callback);
        }

        // probable error cases
        callback(
          determineHttpStatusError(xhr.status),
          xhr
        );


      });

      return req;
    }
  };

  module.exports = Abstract;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/abstract'), Caldav] :
    [module, require('../caldav')]
));
