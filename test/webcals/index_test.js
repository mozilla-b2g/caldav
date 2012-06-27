testSupport.require('/webcals');

suite('webcals', function() {

  test('namespaces', function() {
    assert.ok(sax);
    assert.ok(Webcals);
    assert.ok(Webcals.Request);
    assert.ok(Webcals.Templates);
    assert.ok(Webcals.Xhr);
  });

});
