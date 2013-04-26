(function(module, ns) {

  var XHR = ns.require('xhr');

  function BasicAuth(connection, options) {
    // create a clone of options
    var clone = Object.create(null);

    if (typeof(options) !== 'undefined') {
      for (var key in options) {
        clone[key] = options[key];
      }
    }

    // add the appropriate options (user/password)
    if (connection.password)
      clone.password = connection.password;

    if (connection.user)
      clone.user = connection.user;

    XHR.call(this, clone);
  }

  BasicAuth.prototype = {
    __proto__: XHR.prototype
  };


  module.exports = BasicAuth;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('http/basic_auth'), Caldav] :
    [module, require('../caldav')]
));

