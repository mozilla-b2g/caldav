testSupport.lib('responder');
testSupport.lib('sax');
testSupport.lib('sax/base');
testSupport.lib('sax/calendar_data_handler');

suite('caldav/sax/calendar_data_handler', function() {


  var Parse;
  var Base;
  var Handler;

  suiteSetup(function() {
    Parse = Caldav.require('sax');
    Base = Caldav.require('sax/base');
    Handler = Caldav.require('sax/calendar_data_handler');
  });

  var subject;
  var proxy;

  function callProxy() {
    var args = Array.prototype.slice.call(arguments);
    var method = args.shift();
    return subject[method].apply(proxy, args);
  }

  setup(function() {
    subject = Handler;
    proxy = {
      current: {},
      currentTag: [0],
      handler: { tagField: 0 }
    };
  });

  suite('ontext', function() {
    var originalHandler;

    suiteSetup(function() {
      originalHandler = Handler.parseICAL;
    });

    teardown(function() {
      Handler.parseICAL = originalHandler;
    });

    test('without handler', function() {
      callProxy('ontext', 'foo');
      assert.equal(proxy.current[0], 'foo');
    });

    test('with handler', function() {
      var calledWith;
      Handler.parseICAL = function() {
        calledWith = arguments;
        return 'hit';
      }

      callProxy('ontext', 'baz');
      assert.deepEqual(calledWith, ['baz']);
      assert.equal(proxy.current[0], 'hit');
    });
  });
});

