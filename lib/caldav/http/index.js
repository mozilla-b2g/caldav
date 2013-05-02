(function(module, ns) {

  module.exports = {
    BasicAuth: ns.require('http/basic_auth'),
    OAuth2: ns.require('http/oauth2')
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('http'), Caldav] :
    [module, require('../caldav')]
));

