(function(module, ns) {

  module.exports = {
    Base: ns.require('sax/base'),
    CalendarDataHandler: ns.require('sax/calendar_data_handler'),
    DavResponse: ns.require('sax/dav_response')
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('sax'), Caldav] :
    [module, require('../caldav')]
));

