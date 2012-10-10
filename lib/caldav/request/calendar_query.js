(function(module, ns) {

  var Propfind = ns.require('request/propfind');
  var Builder = ns.require('query_builder');

  /**
   * Creates a calendar query request.
   *
   * Defaults to Depth of 1.
   *
   * @param {CalDav.Connection} connection connection object.
   * @param {Object} options options for calendar query.
   */
  function CalendarQuery(connection, options) {
    Propfind.apply(this, arguments);

    this.xhr.headers['Depth'] = this.depth || 1;
    this.xhr.method = 'REPORT';

    this.template.rootTag = ['caldav', 'calendar-query'];

    this.data = new Builder({
      template: this.template
    });

    this.filter = new Builder({
      template: this.template,
      tag: ['caldav', 'filter'],
      propTag: ['caldav', 'prop-filter'],
      compTag: ['caldav', 'comp-filter']
    });
  }

  CalendarQuery.prototype = {
    __proto__: Propfind.prototype,

    _createPayload: function() {
      var content;
      var props;

      props = this._props.join('');

      if (this.data) {
        props += this.data.toString();
      }

      content = this.template.tag('prop', props);

      if (this.filter) {
        content += this.filter.toString();
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
