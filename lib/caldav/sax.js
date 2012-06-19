(function(module, ns) {

  var sax = require('sax'),
      Responder = ns.require('responder');

  function Parser() {
    var dispatch = [
      'onerror',
      'onopentag',
      'onclosetag',
      'ontext'
    ];

    this.parse = sax.parser(true, {
      xmlns: true,
      trim: true,
      normalize: true,
      lowercase: true
    });

    dispatch.forEach(function(event) {
      this.parse[event] = this._dispatchEvent.bind(this, event);
    }, this);

    this.parse.onend = this.onend.bind(this);

    this.depth = 0;
    this.handles = {};

    this.stack = [];
    this.handlerStack = [];
    this.tagStack = [];

    this.current = this.root = {};
    this.setParser(this);

    Responder.call(this);
  }

  Parser.prototype = {

    __proto__: Responder.prototype,

    setParser: function(parse) {
      this.currentParser = parse;
    },

    restoreParser: function() {
      if ('oncomplete' in this.currentParser) {
        this.currentParser.oncomplete.call(this);
      }

      var parser = this.handlerStack.pop();
      this.setParser(parser || this);
    },

    _dispatchEvent: function(type, data) {

      if (type === 'onopentag') {
        data.tagSpec = data.uri + '/' + data.local;
      }

      if (type in this.currentParser) {
        this.currentParser[type].call(this, data);
      } else {
        this[type](data);
      }
    },

    addHandler: function(obj) {
      this.handles[obj.tag] = obj;
    },

    checkHandler: function(handle) {
      var handler,
          handlers = this.currentParser.handles;

      if (handle in handlers) {
        handler = handlers[handle];
        if (handler !== this.currentParser) {
          return handler;
        }
      }

      return false;
    },

    handleError: function() {
    },

    onopentag: function(data) {
      var current = this.current,
          name = data.local,
          handler = this.checkHandler(data.tagSpec);

      if (handler) {
        this.handlerStack.push(this.currentParser);
        this.setParser(handler);
        return this._dispatchEvent('onopentag', data);
      }

      this.tagStack.push(data.tagSpec);
      this.stack.push(this.current);

      if (name in current) {
        var next = {};

        if (!(current[name] instanceof Array)) {
          current[name] = [current[name]];
        }

        current[name].push(next);
        this.current = next;
      } else {
        this.current = current[name] = {};
      }
    },

    onend: function() {
      this.emit('complete', this.root, this);
    },

    checkStackForHandler: function(restore) {
      var stack = this.tagStack,
          last = stack[stack.length - 1],
          result;

      result = last === this.currentParser.tag;

      if (restore && result) {
        this.restoreParser();
      }

      return result;
    },

    onclosetag: function() {
      this.current = this.stack.pop();
      this.tagStack.pop();
    },

    ontext: function(data) {
      this.current.value = data;
    },

    write: function(data) {
      return this.parse.write(data);
    }
  };

  module.exports = Parser;

}.apply(
  this,
  (this.CalDav) ?
    [CalDav('xml_parser'), CalDav] :
    [module, require('./caldav')]
));
