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
   * @name Caldav.Xhr
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
      if (Object.hasOwnProperty.call(options, key)) {
        this[key] = options[key];
      }
    }
  }

  Xhr.prototype = {
    globalXhrOptions: null,
    xhrClass: Native,
    method: 'GET',
    async: true,
    waiting: false,
    user: null,
    password: null,
    url: null,

    headers: {},
    data: null,

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
     * @param {String} user basic auth user.
     * @param {String} password basic auth pass.
     * @return {String} basic auth token.
     */
    _credentials: function(user, pass) {
      // this code should never run in nodejs.
      return 'Basic ' + window.btoa(
        user + ':' + pass
      );
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

      if (this.globalXhrOptions) {
        xhr = new this.xhrClass(this.globalXhrOptions);
      } else {
        xhr = new this.xhrClass();
      }

      this.xhr = xhr;

      // This hack is in place due to some platform
      // bug in gecko when using mozSystem xhr
      // the credentials only seem to work as expected
      // when constructing them manually.
      if (!this.globalXhrOptions || !this.globalXhrOptions.mozSystem) {
        xhr.open(this.method, this.url, this.async, this.user, this.password);
      } else {
        xhr.open(this.method, this.url, this.async);
        xhr.setRequestHeader('Authorization', this._credentials(
          this.user,
          this.password
        ));
      }

      for (header in this.headers) {
        if (Object.hasOwnProperty.call(this.headers, header)) {
          xhr.setRequestHeader(header, this.headers[header]);
        }
      }

      xhr.onreadystatechange = function onReadyStateChange() {
        var data;
        if (xhr.readyState === 4) {
          data = xhr.responseText;
          this.waiting = false;
          callback(null, xhr);
        }
      }.bind(this);

      this.waiting = true;
      xhr.send(this._seralize());
    }
  };

  module.exports = Xhr;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('xhr'), Caldav] :
    [module, require('./caldav')]
));
