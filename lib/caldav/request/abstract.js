(function(module, ns) {

  var SAX = ns.require('sax');
  var XHR = ns.require('xhr');

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

    console.log('[request] CREATE' + '\n' +
         JSON.stringify(this) + '\n');
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

      console.log('[request] SEND' + '\n' +
           JSON.stringify(req) + '\n');

      // in the future we may stream data somehow
      req.send(function xhrResult(err, xhr) {
        if (err) {
          console.error('[request] ERROR' + '\n' +
               err.toString() + '\n');
          return callback(err);
        }

        self.sax.close();
        console.log('[request] RESULT' + '\n' +
             JSON.stringify(self.sax.root) + '\n');
        return self._processResult(req, callback);
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
