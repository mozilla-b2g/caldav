(function(module, ns) {

  module.exports = {
    Abstract: ns.require('request/abstract'),
    CalendarQuery: ns.require('request/calendar_query'),
    Propfind: ns.require('request/propfind'),
    CalendarHome: ns.require('request/calendar_home'),
    Resources: ns.require('request/resources'),
    Asset: ns.require('request/asset')
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request'), Caldav] :
    [module, require('../caldav')]
));
