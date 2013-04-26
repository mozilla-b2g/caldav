(function(module, ns) {

  module.exports = {
    BasicAuth: ns.require('http/basic_auth')
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('http'), Caldav] :
    [module, require('../caldav')]
));

