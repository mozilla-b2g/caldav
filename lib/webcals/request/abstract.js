(function(module, ns) {

  var SAX = ns.require('sax');
  var XHR = ns.require('xhr');


  /**
   * Creates an (Web/Cal)Dav request.
   *
   * @param {String} url location of resource.
   * @param {Object} options additional options for request.
   */
  function Abstract(url, options) {
    var key;

    if (typeof(url) === 'undefined' || !url) {
      throw new Error('request requires a url');
    }

    this.url = url;
    this.sax = new SAX();

    for (key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }

    this.xhr = new XHR({
      url: this.url
    });
  }

  Abstract.prototype = {

    _createPayload: function() {
      return '';
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

          callback(null, self.sax.root, req);
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
  (this.Webcals) ?
    [Webcals('request/abstract'), Webcals] :
    [module, require('../webcals')]
));
