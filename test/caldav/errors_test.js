testSupport.lib('errors');

suite('errors/authentication', function() {
  var Errors;

  suiteSetup(function() {
    Errors = Caldav.require('errors');
  });

  function verifyErrorExists(symbol) {
    test(symbol, function() {
      var error = new Errors[symbol]('oops');
      assert.equal(error.message, 'oops');
      assert.ok(error.name, 'has name');
      assert.ok(error.stack, 'has stack');
    });
  }

  // why grouped? gjslint hates us otherwise
  ([
    'Authentication',
    'InvalidEntrypoint',
    'ServerFailure',
    'Unknown'
  ]).forEach(verifyErrorExists);

});
