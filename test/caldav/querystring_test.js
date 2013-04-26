testSupport.lib('querystring');

suite('caldav/querystring', function() {
  var QueryString;

  suiteSetup(function() {
    QueryString = Caldav.require('querystring');
  });

  /*
   * quick sanity check we just copied node's version so we expect it to work.
   */
  test('stringify', function() {
    var input = { foo: 'bar', baz: 'qux' };
    var expected = 'foo=bar&baz=qux';

    assert.equal(QueryString.stringify(input), expected);
  });
});
