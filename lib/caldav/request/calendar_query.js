(function(module, ns) {

  var Propfind = ns.require('request/propfind');
  var CalendarData = ns.require('templates/calendar_data');
  var CalendarFilter = ns.require('templates/calendar_filter');

  /**
   * Creates a calendar query request.
   *
   * Defaults to Depth of 1.
   *
   * @param {CalDav.Connection} connection connection object.
   * @param {Object} options options for calendar query.
   */
  function CalendarQuery(options) {
    Propfind.apply(this, arguments);

    this.xhr.headers['Depth'] = this.depth || 1;
    this.xhr.method = 'REPORT';
    this.fields = new CalendarData();
    this.filters = new CalendarFilter();

    this.template.rootTag = ['caldav', 'calendar-query'];
  }

  CalendarQuery.prototype = {
    __proto__: Propfind.prototype,

    _createPayload: function() {
      var content;
      var props;

      props = this._props.join('');

      if (this.fields) {
        props += this.fields.render(this.template);
      }

      content = this.template.tag('prop', props);

      if (this.filters) {
        content += this.filters.render(this.template);
      }

      return this.template.render(content);
    }

  };

  module.exports = CalendarQuery;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/calendar_query'), Caldav] :
    [module, require('../caldav')]
));
