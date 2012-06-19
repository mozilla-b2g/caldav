var xml = requireLib('sax');

suite('sax test', function() {

  var data,
      subject;

  test('existance', function() {
    return;
    var parser = new xml();

    var StatusHandler = {
      tag: 'DAV:/status',

      onopentag: function(data) {
      },

      ontext: function(data) {
        this.current.status = data.match(/([0-9]{3,3})/)[1];
      },

      onclosetag: function(data) {
        this.restoreParser();
      }
    };

    var ResourceTypeHandler = {
      tag: 'DAV:/resourcetype',

      onopentag: function(data) {
        this.tagStack.push(data.tagSpec);

        if (data.local === 'resourcetype') {
          this.current.resourceTypes = [];
        } else {
          this.current.resourceTypes.push(data.local);
        }
      },

      onclosetag: function(data) {
        this.checkStackForHandler(true);
        this.tagStack.pop();
      }
    };

    var TextOnlyHandler = {
      tag: 'DAV:/href',

      onopentag: function(data) {
      },

      ontext: function(data) {
        this.current.href = data;
      },

      onclosetag: function(data) {
        this.restoreParser();
      }
    };

    var ResponseHandler = {
      tag: 'DAV:/response',
      handles: {
        'DAV:/status': StatusHandler,
        'DAV:/resourcetype': ResourceTypeHandler,
        'DAV:/href': TextOnlyHandler,
        'DAV:/getetag': TextOnlyHandler
      },

      onclosetag: function(data) {
        this.checkStackForHandler(true);
        this.onclosetag(data);
      },

      oncomplete: function() {
        this.emit('response', this.current, this);
      }

    };

    parser.addHandler(ResponseHandler);

    parser.on('response', function(data, context) {
      console.log(JSON.stringify(data), '\n\n');
    });

    parser.once('complete', function(data, parser) {
      console.log(JSON.stringify(data));
    });

    parser.write(data).close();
  });

});
