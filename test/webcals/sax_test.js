testSupport.lib('sax');
testSupport.lib('sax/base');

suite('webcals/sax', function() {

  var data,
      subject,
      SAX,
      Base,
      handler;

  // you should not use instances
  // for handlers this is only
  // to make testing easier.
  function TestHander() {
    this.text = [];
    this.opentag = [];
    this.closetag = [];
    this.error = [];
    this.complete = [];
    this.end = [];

    var events = [
      'ontext', 'onclosetag',
      'onopentag', 'onerror',
      'oncomplete', 'onend'
    ];
  }

  TestHander.prototype = {

    ontext: function(data, handler) {
      handler.text.push(data);
    },

    onclosetag: function(data, handler) {
      handler.closetag.push(data);
    },

    onopentag: function(data, handler) {
      handler.opentag.push(data);
    },

    onerror: function(data, handler) {
      handler.error.push(data);
    },

    oncomplete: function(data, handler) {
      handler.complete.push(data);
    },

    onend: function(data) {
      handler.end.push(data);
    }
  };

  function firesHandler(type, data) {
    var len = handler[type].length;
    var event = handler[type][len - 1];

    assert.deepEqual(event, data);
  }

  suiteSetup(function() {
    SAX = Webcals.require('sax');
    Base = Webcals.require('sax/base');
  });

  setup(function() {
    handler = new TestHander();
    subject = new SAX(handler);
  });

  test('initializer', function() {
    assert.equal(subject.handler, handler);
    assert.deepEqual(subject.stack, []);
    assert.deepEqual(subject.handles, {});
    assert.deepEqual(subject._handlerStack, []);
    assert.deepEqual(subject.tagStack, []);
    assert.ok(subject._parse);
  });

  suite('#setHandler', function() {

    setup(function() {
      subject.setHandler(handler, false);
    });

    test('set without store', function() {
      assert.equal(subject.handler, handler);

      assert.equal(
        subject._handlerStack.length,
        0,
        'should not save original'
      );
    });

    test('set/store', function() {
      var uniq = {};

      subject.setHandler(uniq, true);

      assert.equal(subject.handler, uniq);
      assert.equal(subject._handlerStack[0], handler);
    });

  });

  test('#restoreHandler', function() {
    var uniq = {};
    subject.setHandler(uniq, true);
    subject.restoreHandler();

    assert.equal(subject.handler, handler);
  });

  test('#registerHandler', function() {
    var uniq = {};

    subject.registerHandler('a/foo', uniq);
    assert.equal(subject.handles['a/foo'], uniq);
  });

  test('#write', function() {
    var called, uniq = {};
    subject._parse.write = function() {
      return uniq;
    };

    assert.equal(subject.write(), uniq);
  });

  test('#closed', function() {
    assert.isFalse(subject.closed, 'should not be closed');

    subject._parse.closed = true;
    assert.isTrue(
      subject.closed,
      'should be closed now that parser is.'
    );
  });

  suite('#getHandler', function() {
    test('handler not found', function() {
      assert.isFalse(subject.getHandler('foo'));
    });

    test('handler found', function() {
      var uniq;

      subject.registerHandler('foo', uniq);

      var handler = subject.getHandler('foo');
      assert.equal(uniq, handler);
    });

    test('handler found but is current', function() {
      var uniq = {};
      subject.registerHandler('foo', uniq);
      subject.setHandler(uniq);

      assert.isFalse(subject.getHandler('foo'));
    });
  });

  suite('#onopentag', function() {

    test('basic event', function() {
      var obj = {
        local: 'foo',
        uri: 'bar',
        name: 'foo'
      };

      subject.onopentag(obj);
      assert.equal(obj.tagSpec, 'bar/foo');
      assert.deepEqual(
        subject.tagStack[0].tagSpec,
        'bar/foo',
        'works'
      );

      firesHandler('opentag', obj);
    });
  });

  suite('handler stacks', function() {
    var newHandler;

    setup(function() {
      newHandler = new TestHander();
      subject.registerHandler('a/a', newHandler);
      subject.onopentag({
        local: 'a',
        uri: 'a',
        name: 'a'
      });
    });

    test('switch to new handler', function() {
      assert.equal(subject.handler, newHandler);
      assert.deepEqual(
        subject.tagStack, [
          { tagSpec: 'a/a', local: 'a', name: 'a', handler: newHandler }
        ]
      );
    });

    test('pop to original handler', function() {
      subject.onclosetag('a/a');
      assert.equal(subject.tagStack.length, 0, 'should clear tagStack');
      assert.equal(subject.handler, handler, 'should reset handler');
      assert.equal(
        newHandler.complete.length, 1,
        'should fire complete event on new handler'
      );
    });

  });

  test('#onclosetag', function() {
    var obj = { local: 'a', uri: 'b' };

    subject.onopentag(obj);
    assert.equal(subject.tagStack.length, 1);

    subject.onclosetag('a:b');
    assert.equal(subject.tagStack.length, 0);

    firesHandler('closetag', 'a:b');
  });

  test('#ontext', function() {
    subject.ontext('foo');
    firesHandler('text', 'foo');
  });

  test('#onerror', function() {
    subject.onerror('foo');
    firesHandler('error', 'foo');
  });

  test('#onend', function() {
    subject.onend();
    assert.ok(handler.end);
    assert.equal(handler.end[0], subject.root);
  });

 suite('complex mutli-handler', function() {
    var xml,
        expected,
        events;

    var ResponseHandler;
    var TextOnlyHandler;

    testSupport.defineSample('xml/complex-tree.xml', function(data) {
      xml = data;
    });

    suiteSetup(function() {
      TextOnlyHandler = Base.create({
        name: 'text',

        //don't add text only elements
        //to the stack as objects
        onopentag: function() {},
        onclosetag: function() {},

        //add the value to the parent
        //value where key is local tag name
        //and value is the text.
        ontext: function(data) {
          var handler = this.handler;
          this.current[this.currentTag[handler.tagField]] = data;
        }
      });

      ResponseHandler = Base.create({
        name: 'response',

        onopentag: function(data, handler) {
          //if you don't want to append items
          //to the object its fairly simple just
          //orphan the tag.
          if (data.tagSpec === 'DAV:/response') {
            return this.current = {};
          }

          handler._super.onopentag.call(this, data, handler);
        },

        handles: {
          'DAV:/href': TextOnlyHandler,
          'DAV:/status': TextOnlyHandler,
          'DAV:/getetag': TextOnlyHandler
        },

        oncomplete: function() {
          events.push(this.current);
        }
      });
    });

    setup(function() {
      //use real handlers
      subject.setHandler(Base);
    });

    test('complex result', function() {
      var result,
          expectedEvent,
          expectedResult;

      events = [];

      expectedEvent = {
        href: 'uri',
        propstat: [
          {
            status: '400',
            prop: {
              current: {}
            }
          },
          {
            status: '200',
            prop: {
              next: {}
            }
          }
        ]
      };

      expectedResult = {
        complex: {
        }
      };

      subject.registerHandler('DAV:/response', ResponseHandler);

      subject.on('response', function(data) {
        events.push(data);
      });

      subject.once('complete', function(data) {
        result = data;
      });

      subject.write(xml).close();

      assert.ok(events[0]);
      assert.equal(events.length, 2);

      assert.ok(result);

      assert.deepEqual(events[0], {});
      assert.deepEqual(events[1], expectedEvent);
      assert.deepEqual(result, expectedResult);
    });

  });

});
