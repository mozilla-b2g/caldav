(function(module, ns) {

  var Responder = ns.require('responder');

  if (typeof(sax) === 'undefined') {
    Parser.sax = require('sax');
  } else {
    Parser.sax = sax;
  }

  /**
   * Creates a parser object.
   *
   * @param {Object} baseHandler base sax handler.
   */
  function Parser(baseHandler) {
    var handler;

    var events = [
      'ontext',
      'onopentag',
      'onclosetag',
      'onerror',
      'onend'
    ];

    if (typeof(baseHandler) !== 'undefined') {
      handler = baseHandler;
    } else {
      handler = ns.require('sax/base');
    }

    this.stack = [];
    this.handles = {};
    this._handlerStack = [];
    this.tagStack = [];
    this.root = this.current = {};

    this.setHandler(handler);

    this._parse = Parser.sax.parser(true, {
      xmlns: true,
      trim: true,
      normalize: false,
      lowercase: true
    });

    events.forEach(function(event) {
      this._parse[event] = this[event].bind(this);
    }, this);

    Responder.call(this);
  }

  Parser.prototype = {

    __proto__: Responder.prototype,

    /**
     * Sets current handler, optionally adding
     * previous one to the handlerStack.
     *
     * @param {Object} handler new handler.
     * @param {Boolean} storeOriginal store old handler?
     */
    setHandler: function(handler, storeOriginal) {
      if (storeOriginal) {
        this._handlerStack.push(this.handler);
      }

      this.handler = handler;
    },

    /**
     * Sets handler to previous one in the stack.
     */
    restoreHandler: function() {
      if (this._handlerStack.length) {
        this.handler = this._handlerStack.pop();
      }
    },

    /**
     * Registers a top level handler
     *
     * @param {String} tag xmlns uri/local tag name for example
     *                     DAV:/a.
     *
     * @param {Object} handler new handler to use when tag is
     *                         triggered.
     */
    registerHandler: function(tag, handler) {
      this.handles[tag] = handler;
    },

    /**
     * Writes data into the parser.
     *
     * @param {String} chunk partial/complete chunk of xml.
     */
    write: function(chunk) {
      return this._parse.write(chunk);
    },

    get closed() {
      return this._parse.closed;
    },

    /**
     * Determines if given tagSpec has a specific handler.
     *
     * @param {String} tagSpec usual tag spec.
     */
    getHandler: function(tagSpec) {
      var handler;
      var handlers = this.handler.handles;

      if (!handlers) {
        handlers = this.handles;
      }

      if (tagSpec in handlers) {
        handler = handlers[tagSpec];

        if (handler !== this.handler) {
          return handler;
        }
      }

      return false;
    },

    _fireHandler: function(event, data) {
      if (typeof(this.handler[event]) === 'function') {
        this.handler[event].call(this, data, this.handler);
      }
    },

    onopentag: function(data) {
      var handle;
      var stackData = {
        local: data.local,
        name: data.name
      };

      //build tagSpec for others to use.
      data.tagSpec = data.uri + '/' + data.local;

      //add to stackData
      stackData.tagSpec = data.tagSpec;

      // shortcut to the current tag object
      this.currentTag = stackData;

      //determine if we need to switch to another
      //handler object.
      handle = this.getHandler(data.tagSpec);

      if (handle) {
        //switch to new handler object
        this.setHandler(handle, true);
        stackData.handler = handle;
      }

      this.tagStack.push(stackData);
      this._fireHandler('onopentag', data);
    },

    //XXX: optimize later
    get currentTag() {
      return this.tagStack[this.tagStack.length - 1];
    },

    onclosetag: function(data) {
      var stack, handler;

      stack = this.currentTag;

      if (stack.handler) {
        //fire oncomplete handler if available
        this._fireHandler('oncomplete');
      }

      //fire the onclosetag event
      this._fireHandler('onclosetag', data);

      if (stack.handler) {
        //restore previous handler
        this.restoreHandler();
      }

      //actually remove the stack tag
      this.tagStack.pop();
    },

    ontext: function(data) {
      this._fireHandler('ontext', data);
    },

    onerror: function(data) {
      //TODO: XXX implement handling of parsing errors.
      //unlikely but possible if server goes down
      //or there is some authentication issue that
      //we miss.
      this._fireHandler('onerror', data);
    },

    onend: function() {
      this._fireHandler('onend', this.root);
    }
  };

  module.exports = Parser;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('xml_parser'), Webcals] :
    [module, require('./webcals')]
));
