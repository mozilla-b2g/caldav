(function(module, ns) {

  module.exports = {
    Calendar: ns.require('resources/calendar')
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('resources'), Caldav] :
    [module, require('../caldav')]
));

