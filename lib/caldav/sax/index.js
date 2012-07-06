(function(module, ns) {

  module.exports = {
    Abstract: ns.require('sax/abstract'),
    CalendarQuery: ns.require('sax/dav_response')
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('sax'), Caldav] :
    [module, require('../caldav')]
));

