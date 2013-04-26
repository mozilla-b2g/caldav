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

    clone.password = connection.password || clone.password;
    clone.user = connection.user || clone.user;

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

