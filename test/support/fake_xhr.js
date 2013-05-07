(function(module) {
  function FakeXhr() {
    this.openArgs = null;
    this.sendArgs = null;
    this.headers = {};
    this.responseHeaders = {};
    this.constructorArgs = arguments;

    FakeXhr.instances.push(this);
  }

  FakeXhr.instances = [];

  FakeXhr.prototype = {
    open: function() {
      this.openArgs = Array.prototype.slice.call(arguments);
    },

    getResponseHeader: function(key) {
      return this.responseHeaders[key];
    },

    setRequestHeader: function(key, value) {
      this.headers[key] = value;
    },

    send: function() {
      this.sendArgs = Array.prototype.slice.call(arguments);
    },

    respond: function(data, code, headers) {
      if (headers) {
        this.responseHeaders = headers;
      } else {
        this.responseHeaders['content-type'] = 'text/xml';
      }

      this.readyState = 4;
      this.responseText = data;
      this.status = code || 200;
      this.onreadystatechange();
    }
  };

  module.exports = FakeXhr;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('support/fake_xhr'), Caldav] :
    [module, require('../../lib/caldav/caldav')]
));
