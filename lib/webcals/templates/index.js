(function(module, ns) {

  module.exports = {
    CalendarData: ns.require('templates/calendar_data'),
    CalendarFilter: ns.require('templates/calendar_filter')
  };

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('templates'), Webcals] :
    [module, require('../webcals')]
));
