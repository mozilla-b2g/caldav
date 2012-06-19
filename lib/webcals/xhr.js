/**
@namespace
*/
(function(module, ns) {
  var Native;

  if (typeof(window) === 'undefined') {
    Native = require('xmlhttprequest').XMLHttpRequest;
  } else {
    Native = window.XMLHttpRequest;
  }

  /**
   * Creates a XHR wrapper.
   * Depending on the platform this is loaded
   * from the correct wrapper type will be used.
   *
   * Options are derived from properties on the prototype.
   * See each property for its default value.
   *
   * @class
   * @name CalDav.Xhr
   * @param {Object} options options for xhr.
   * @param {String} [options.method="GET"] any HTTP verb like 'GET' or 'POST'.
   * @param {Boolean} [options.async] false will indicate
   *                   a synchronous request.
   * @param {Object} [options.headers] full of http headers.
   * @param {Object} [options.data] post data.
   */
  function Xhr(options) {
    var key;
    if (typeof(options) === 'undefined') {
      options = {};
    }

    for (key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }
  }

  Xhr.prototype = {
    /** @scope CalDav.Xhr.prototype */

    xhrClass: Native,
    method: 'GET',
    async: true,
    waiting: false,
    user: null,
    password: null,

    headers: {},
    data: {},

    _seralize: function _seralize() {
      return this.data;
    },

    /**
     * Aborts request if its in progress.
     */
    abort: function abort() {
      if (this.xhr) {
        this.xhr.abort();
      }
    },

    /**
     * Sends request to server.
     *
     * @param {Function} callback success/failure handler.
     */
    send: function send(callback) {
      var header, xhr;

      if (typeof(callback) === 'undefined') {
        callback = this.callback;
      }

      xhr = this.xhr = new this.xhrClass();
      xhr.open(this.method, this.url, this.async, this.user, this.password);

      for (header in this.headers) {
        if (this.headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, this.headers[header]);
        }
      }

      xhr.onreadystatechange = function onReadyStateChange() {
        var data;
        if (xhr.readyState === 4) {
          data = xhr.responseText;
          this.waiting = false;
          callback(data, xhr);
        }
      }.bind(this);

      this.waiting = true;
      xhr.send(this._seralize());
    }
  };

  module.exports = Xhr;

}.apply(
  this,
  (this.CalDav) ?
    [CalDav('xhr'), CalDav] :
    [module, require('./webcals')]
));
