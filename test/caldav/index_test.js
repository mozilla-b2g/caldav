if (typeof(window) !== 'undefined') {
  testSupport.require('/caldav');
}

suite('caldav', function() {
  var root;
  var isNode = typeof(window) === 'undefined';

  suiteSetup(function() {
    if (isNode) {
      root = require('../../lib/caldav');
    } else {
      root = Caldav;
    }
  });

  suite('browser', function() {
    if (isNode)
      return;

    test('sax', function() {
      assert.ok(sax);
    });
  });

  test('namespaces', function() {
    assert.ok(root);
    assert.ok(root.Request);
    assert.ok(root.Templates);
    assert.ok(root.Xhr);
    assert.ok(root.Connection);
    assert.ok(root.Resources);
    assert.ok(root.Resources.Calendar);
  });

});
