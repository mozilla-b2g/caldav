(function(module, ns) {

  var Propfind = ns.require('request/propfind');

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
  }

  CalendarQuery.prototype = {
    __proto__: Propfind.prototype
  };

  module.exports = CalendarQuery;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('request/calendar_query'), Webcals] :
    [module, require('../webcals')]
));
