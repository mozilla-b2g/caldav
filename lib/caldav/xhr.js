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
    xhr: null,
    method: 'GET',
    async: true,
    waiting: false,
    user: null,
    password: null,
    url: null,
    streaming: true,

    headers: {},
    data: null,

    _serialize: function _serialize() {
      return this.data;
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
     * Aborts the request if it has already been sent.
     * @param {Function=} cb An optional callback function.
     */
    abort: function(cb) {
      if (this.waiting) {
        this.xhr.abort();
        this.waiting = false;
      }

      if (cb !== undefined) {
        cb();
      }
    },

   _buildXHR: function(callback) {
      var header;

      if (typeof(callback) === 'undefined') {
        callback = this.callback;
      }

      this.xhr = new this.xhrClass(
          this.globalXhrOptions ? this.globalXhrOptions : undefined);

      // This hack is in place due to some platform
      // bug in gecko when using mozSystem xhr
      // the credentials only seem to work as expected
      // when constructing them manually.
      if (!this.globalXhrOptions || !this.globalXhrOptions.mozSystem) {
        this.xhr.open(
            this.method, this.url, this.async, this.user, this.password);
      } else {
        this.xhr.open(this.method, this.url, this.async);
        this.xhr.setRequestHeader('Authorization', this._credentials(
          this.user,
          this.password
        ));
      }

      var useMozChunkedText = false;
      if (
        this.streaming &&
        this.globalXhrOptions &&
        this.globalXhrOptions.useMozChunkedText
      ) {
        useMozChunkedText = true;
        this.xhr.responseType = 'moz-chunked-text';
      }

      for (header in this.headers) {
        if (Object.hasOwnProperty.call(this.headers, header)) {
          this.xhr.setRequestHeader(header, this.headers[header]);
        }
      }


      var hasProgressEvents = false;

      // check for progress event support.
      if (this.streaming) {
        if ('onprogress' in this.xhr) {
          hasProgressEvents = true;
          var last = 0;

          if (useMozChunkedText) {
            this.xhr.onprogress = (function onChunkedProgress(event) {
              if (this.ondata) {
                this.ondata(this.xhr.responseText);
              }
            }.bind(this));
          } else {
            this.xhr.onprogress = (function onProgress(event) {
              var chunk = this.xhr.responseText.substr(last, event.loaded);
              last = event.loaded;
              if (this.ondata) {
                this.ondata(chunk);
              }
            }.bind(this));
          }
        }
      }

      this.xhr.onreadystatechange = (function onReadyStateChange() {
        var data;
        if (this.xhr.readyState === 4) {
          data = this.xhr.responseText;

          // emulate progress events for node...
          // this really lame we should probably just
          // use a real http request for node but this
          // will let us do some testing via node for now.
          if (!hasProgressEvents && this.ondata) {
            this.ondata(data);
          }

          this.waiting = false;
          callback(null, this.xhr);
        }
      }.bind(this));

      this.waiting = true;
      return this.xhr;
    },

    /**
     * Sends request to server.
     *
     * @param {Function} callback success/failure handler.
     */
    send: function send(callback) {
      var xhr = this._buildXHR(callback);
      xhr.send(this._serialize());
      return xhr;
    }
  };

  module.exports = Xhr;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('xhr'), Caldav] :
    [module, require('./caldav')]
));
