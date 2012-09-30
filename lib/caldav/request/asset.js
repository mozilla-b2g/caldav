(function(module, ns) {

  var XHR = ns.require('xhr');

  /**
   * Creates an Http request for a single webdav resource.
   * Thin wrapper over http/xhr each public method has the same
   * signature with similar options:
   *
   *    // the intent is that after a larger calendar query
   *    // the urls are stored and can be used to modify the
   *    // calendar resources.
   *    var asset = new Caldav.Request.Asset(con, 'someurl');
   *
   *    asset.get({ etag: 'foo'}, function(err, data) {
   *    });
   *
   *    asset.put({ etag: 'foo' }, body, function(err, data) {
   *
   *    });
   *
   *    asset.delete(function() {
   *
   *    });
   *
   * @param {Caldav.Connection} connection connection details.
   * @param {String} url assert url.
   */
  function Asset(connection, url) {
    if (!connection) {
      throw new Error('must pass connection object');
    }
    this.connection = connection;
    this.url = url;
  }

  Asset.prototype = {

    contentType: 'text/calendar',

    _buildRequest: function(method, options) {
      var headers = {
        'Content-Type': this.contentType
      };

      if (options && options.contentType) {
        headers['Content-Type'] = options.contentType;
      }

      if (options && options.etag) {
        headers['If-None-Match'] = options.etag;
      }

      return this.connection.request({
        url: this.url,
        headers: headers,
        method: method
      });
    },

    /**
     * Find a single calendar asset.
     * This method should only be used to either
     * confirm a put or delete request.
     *
     * Calendar query is far more suited for fetching
     * large amounts of calendar data.
     *
     * Options:
     *  - etag: used to issue a 'If-Not-Match'
     *
     * @param {Object} [options] calendar options.
     * @param {Function} callback node style [err, data, xhr].
     */
    get: function(options, callback) {
      if (typeof(options) === 'function') {
        callback = options;
        options = null;
      }

      var req = this._buildRequest('GET', options);

      req.send(function(err, xhr) {
        callback(err, xhr.responseText, xhr);
      });
    },

    /**
     * Adds or modifies a single calendar resource.
     *
     * @param {Object} [options] see get.
     * @param {String} data post content.
     * @param {Function} callback node style [err, data, xhr].
     */
    put: function(options, data, callback) {
      if (typeof(options) === 'string') {
        data = options;
        options = null;
      }

      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }

      var req = this._buildRequest('PUT', options);
      req.data = data;

      req.send(function(err, xhr) {
        callback(err, xhr.responseText, xhr);
      });
    },

    /**
     * Deletes a calendar resource
     *
     * @param {Object} [options] see get.
     * @param {Function} callback node style [err, data, xhr].
     */
    delete: function(options, callback) {
      if (typeof(options) === 'function') {
        callback = options;
        options = null;
      }

      var req = this._buildRequest('DELETE', options);

      req.send(function(err, xhr) {
        callback(err, xhr.responseText, xhr);
      });
    }
  };

  module.exports = Asset;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/asset'), Caldav] :
    [module, require('../caldav')]
));
