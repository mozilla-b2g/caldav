(function(module, ns) {

  module.exports = {
    BasicAuth: ns.require('http/basic_auth'),
    GoogleOauth: ns.require('http/google_oauth')
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('http'), Caldav] :
    [module, require('../caldav')]
));

