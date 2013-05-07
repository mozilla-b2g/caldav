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
    assert.ok(root, 'Caldav');
    assert.ok(root.Request, 'Caldav.Request');
    assert.ok(root.QueryBuilder, 'Caldav.QueryBuilder');
    assert.ok(root.Xhr, 'Caldav.Xhr');
    assert.ok(root.Connection, 'Caldav.Connection');
    assert.ok(root.Resources, 'Caldav.Resources');
    assert.ok(root.Resources.Calendar, 'Calendar.Resources.Calendar');
    assert.ok(root.OAuth2, 'OAuth2');
    assert.ok(root.Http, 'Http');
    assert.ok(root.Errors, 'Errors');
  });

});
