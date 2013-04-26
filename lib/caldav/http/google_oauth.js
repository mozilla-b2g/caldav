(function(module, ns) {

  var XHR = ns.require('xhr');

  function GoogleOauth(connection, options) {
    // create a clone of options
    var clone = Object.create(null);

    if (typeof(options) !== 'undefined') {
      for (var key in options) {
        clone[key] = options[key];
      }
    }

    XHR.call(this, clone);
  }

  GoogleOauth.requiresIntialAuth = true;

  GoogleOauth.prototype = {
    __proto__: XHR.prototype
  };


  module.exports = GoogleOauth;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('http/google_oauth'), Caldav] :
    [module, require('../caldav')]
));


