(function(module, ns) {

  var HTTP_STATUS = /([0-9]{3,3})/;

  var Base = ns.require('sax/base');
  var CalendarDataHandler = ns.require('sax/calendar_data_handler');

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

  var HrefHandler = Base.create({
    name: 'href',

    onopentag: function() {
      if (this.currentTag.handler === this.handler) {
        this.stack.push(this.current);
        this.current = null;
      }
    },

    onclosetag: function() {
      var current = this.currentTag;
      var data;

      if (current.handler === this.handler) {
        data = this.current;

        this.current = this.stack.pop();
        this.current[current.local] = data;
      }
    },

    ontext: function(data) {
      if (this.currentTag.local === 'href') {
        this.current = data;
      }
    }

  });

  var HttpStatusHandler = TextHandler.create({
    name: 'status',

    ontext: function(data, handler) {
      var match = data.match(HTTP_STATUS);

      if (match) {
        handler = this.handler;
        this.current[this.currentTag[handler.tagField]] = match[1];
      } else {
        this._super.ontext.call(this, data, handler);
      }
    }
  });

  var PrivilegeSet = Base.create({
    name: 'PrivilegeSet',

    onopentag: function(data) {
      if (this.currentTag.handler === this.handler) {
        this.stack.push(this.current);
        this.current = [];
      } else {
        if (data.tagSpec !== 'DAV:/privilege') {
          this.current.push(data.local);
        }
      }
    },

    onclosetag: function(data) {
      var current = this.currentTag;

      if (current.handler === this.handler) {
        data = this.current;

        this.current = this.stack.pop();
        this.current[current.local] = data;
      }
    },

    ontext: null

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

      if (last.handler && last.handler === handler) {
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
      'http://calendarserver.org/ns//getctag': TextHandler,
      'DAV:/status': HttpStatusHandler,
      'DAV:/resourcetype': ArrayHandler,
      'DAV:/current-user-privilege-set': PrivilegeSet,
      'DAV:/principal-URL': HrefHandler,
      'DAV:/current-user-principal': HrefHandler,
      'urn:ietf:params:xml:ns:caldav/calendar-data': CalendarDataHandler,
      'DAV:/value': TextHandler,
      'DAV:/owner': HrefHandler,
      'DAV:/getetag': HrefHandler,
      'DAV:/displayname': TextHandler,
      'urn:ietf:params:xml:ns:caldav/calendar-home-set': HrefHandler,
      'urn:ietf:params:xml:ns:caldav/calendar-timezone': TextHandler,
      'http://apple.com/ns/ical//calendar-color': TextHandler,
      'urn:ietf:params:xml:ns:caldav/calendar-description': TextHandler
    },

    onopentag: function(data, handler) {
      //orphan
      if (data.tagSpec === 'DAV:/propstat') {
        //blank slate propstat
        if (!('propstat' in this.current)) {
          this.current['propstat'] = {};
        }

        this.stack.push(this.current);

        //contents will be copied over later.
        return this.current = {};
      }

      handler._super.onopentag.call(this, data, handler);
      return null;
    },

    oncomplete: function() {
      var propstat = this.stack[this.stack.length - 1];
      propstat = propstat.propstat;
      var key;
      var status = this.current.status;
      var props = this.current.prop;

      delete this.current.status;
      delete this.current.prop;

      for (key in props) {
        if (Object.hasOwnProperty.call(props, key)) {
          propstat[key] = {
            status: status,
            value: props[key]
          };
        }
      }
    }
  });

  var Response = Base.create({
    name: 'dav_response',
    handles: {
      'DAV:/href': TextHandler,
      'DAV:/propstat': PropStatHandler
    },

    onopentag: function(data, handler) {
      if (data.tagSpec === 'DAV:/response') {
        this.stack.push(this.current);
        return this.current = {};
      }

      handler._super.onopentag.call(this, data, handler._super);
      return null;
    },

    oncomplete: function() {
      var parent;

      if (this.current.href) {
        this.emit(
          'DAV:/response',
          this.current.href,
          this.current.propstat
        );
        parent = this.stack[this.stack.length - 1];
        parent[this.current.href] = this.current.propstat;
      }
    }

  });

  module.exports = Response;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('sax/dav_response'), Caldav] :
    [module, require('../caldav')]
));
