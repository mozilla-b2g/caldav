(function(module, ns) {

  var CalendarData = ns.require('templates/calendar_data');

  function CalendarFilter() {
    CalendarData.call(this);
  }

  CalendarFilter.prototype = {

    __proto__: CalendarData.prototype,

    filter: CalendarData.prototype.select,

    compName: 'comp-filter',
    rootName: 'filter'
  };

  module.exports = CalendarFilter;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('templates/calendar_data'), Webcals] :
    [module, require('../webcals')]
));

