(function(module, ns) {

  var Propfind = ns.require('request/propfind');
  var CalendarData = ns.require('templates/calendar_data');

  /**
   * Creates a calendar query request.
   *
   * Defaults to Depth of 1.
   *
   * @param {String} url location to make request.
   * @param {Object} options options for calendar query.
   */
  function CalendarQuery(url, options) {
    Propfind.apply(this, arguments);

    this.xhr.headers['Depth'] = this.depth || 1;
    this.xhr.method = 'REPORT';
    this.fields = new CalendarData();
    this.template.rootTag = 'calendar-query';
  }

  CalendarQuery.prototype = {
    __proto__: Propfind.prototype,

    _createPayload: function() {
      var props = this._props.join('');
      props += this.fields.render(this.template);
      var content = this.template.tag('prop', props);
      return this.template.render(content);
    }

  };

  module.exports = CalendarQuery;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('request/calendar_query'), Webcals] :
    [module, require('../webcals')]
));
