(function(module, ns) {

  var HTTP_STATUS = /([0-9]{3,3})/;

  var Base = ns.require('sax/base');

  var TextHandler = Base.create({
    name: 'text',

    //don't add text only elements
    //to the stack as objects
    onopentag: null,
    onclosetag: null,

    //add the value to the parent
    //value where key is local tag name
    //and value is the text.
    ontext: function(data) {
      var handler = this.handler;
      this.current[this.currentTag[handler.tagField]] = data;
    }
  });

  var HttpStatusHandler = TextHandler.create({
    name: 'status',

    ontext: function(data, handler) {
      var match = data.match(HTTP_STATUS);

      if (match) {
        var handler = this.handler;
        this.current[this.currentTag[handler.tagField]] = match[1];
      } else {
        this._super.ontext.call(this, data, handler);
      }
    }
  });

  var ArrayHandler = Base.create({
    name: 'array',

    handles: {
      'DAV:/href': TextHandler
    },

    onopentag: function(data, handler) {
      var last;
      var tag = data[handler.tagField];
      var last = this.tagStack[this.tagStack.length - 1];

      if (last.handler === handler) {
        this.stack.push(this.current);
        this.current = this.current[tag] = [];
      } else {
        this.current.push(tag);
      }
    },

    ontext: null,
    onclosetag: null,

    oncomplete: function() {
      this.current = this.stack.pop();
    }

  });

  var PropStatHandler = Base.create({
    name: 'propstat',

    handles: {
      'DAV:/href': TextHandler,
      'DAV:/status': HttpStatusHandler,
      'DAV:/resourcetype': ArrayHandler
    },

    onopentag: function(data, handler) {
      //orphan
      if (data.tagSpec === 'DAV:/propstat') {
        this.stack.push(this.current);
        return this.current = {};
      }

      handler._super.onopentag.call(this, data, handler);
    },

    oncomplete: function() {
      var parent = this.stack[this.stack.length - 1];
      var key;

      //console.log(this.current);

      for (key in this.current.prop) {
        if (this.current.prop.hasOwnProperty(key)) {
          parent[key] = {
            status: this.current.status,
            value: this.current.prop[key]
          }
        }
      }
    },

  });

  var Response = Base.create({
    name: 'dav_response',
    handles: {
      'DAV:/href': TextHandler,
      'DAV:/propstat': PropStatHandler
    },

    //onopentag: function(data, handler) {
      //if (data.tagSpec === 'DAV:/response') {
        //this.stack.push(this.current);
        //return this.current = {};
      //}

      //handler._super.onopentag.call(this, data, handler._super);
    //},

    //oncomplete: function() {
      //var parent;

      //if (this.current.href) {
        //parent = this.stack[this.stack.length - 1];
        //parent[this.current.href] = this.current.propstat;
      //}
    //}

  });

  module.exports = Response;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('sax/dav_response'), Webcals] :
    [module, require('../webcals')]
));

