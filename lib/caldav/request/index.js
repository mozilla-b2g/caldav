(function(module, ns) {

  module.exports = {
    Abstract: ns.require('request/abstract'),
    CalendarQuery: ns.require('request/calendar_query'),
    Propfind: ns.require('request/propfind')
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request'), Caldav] :
    [module, require('../caldav')]
));
