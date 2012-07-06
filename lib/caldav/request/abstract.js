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
      if (options.hasOwnProperty(key)) {
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
     */
    send: function(callback) {
      var self = this;
      var req = this.xhr;
      req.data = this._createPayload();

      // in the future we may stream data somehow
      req.send(function xhrResult() {
        var xhr = req.xhr;
        if (xhr.status > 199 && xhr.status < 300) {
          // success
          self.sax.write(xhr.responseText).close();
          self._processResult(req, callback);
        } else {
          // fail
          callback(new Error('http error code: ' + xhr.status));
        }
      });
    }
  };

  module.exports = Abstract;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/abstract'), Caldav] :
    [module, require('../caldav')]
));
