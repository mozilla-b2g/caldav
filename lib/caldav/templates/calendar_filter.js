(function(module, ns) {

  var CalendarData = ns.require('templates/calendar_data');

  function CalendarFilter() {
    CalendarData.call(this);
  }

  CalendarFilter.prototype = {

    __proto__: CalendarData.prototype,

    add: CalendarData.prototype.select,

    _defaultRender: function(template) {
      var inner = this._renderFieldset(template, { VCALENDAR: [{ VEVENT: true }] });
      return template.tag(['caldav', this.rootName], inner);
    },

    compName: 'comp-filter',
    rootName: 'filter'
  };

  module.exports = CalendarFilter;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('templates/calendar_filter'), Caldav] :
    [module, require('../caldav')]
));

