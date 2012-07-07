(function(module, ns) {

  function MockRequest(connection, options) {
    this.connection = connection;
    this.options = options;

    var parent = this.constructor;

    if (!parent.instances) {
      parent.instances = [];
    }

    parent.instances.push(this);
  }


  MockRequest.prototype = {
    send: function(callback) {
      this.__sendCallback = callback;
    },

    respond: function() {
      this.__sendCallback.apply(this, arguments);
    }

  };

  MockRequest.reset = function() {
    if (!this.instances) {
      this.instances = [];
    }
    this.instances.length = 0;
  }

  MockRequest.create = function(methods) {
    var self = this;

    if (typeof(methods) === 'undefined') {
      methods = [];
    }

    var child = function() {
      self.apply(this, arguments);
    };

    child.prototype = Object.create(self.prototype);
    child.prototype.constructor = child;

    methods.forEach(function(method) {
      child.prototype[method] = function() {
        var savedName = method + 'Calls';
        if (!(savedName in this)) {
          this[savedName] = [];
        }
        this[savedName].push(arguments);
      }
    });

    child.create = self.create;
    child.reset = self.reset;

    return child;
  };

  module.exports = MockRequest;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('support/mock_request'), Caldav] :
    [module, require('../../lib/caldav/caldav')]
));
