(function(module, ns) {

  var Base = ns.require('sax/base');

  var CalendarDataHandler = Base.create({
    name: 'calendar data',

    //don't add text only elements
    //to the stack as objects
    onopentag: null,
    onclosetag: null,

    //add the value to the parent
    //value where key is local tag name
    //and value is the text.
    ontext: function(data) {
      var handler = this.handler;
      this.current[this.currentTag[handler.tagField]] =
        CalendarDataHandler.parseICAL(data);
    }
  });

  /**
   * Default ical parser handler.
   *
   * XXX: Feels a little hacky but works...
   */
  CalendarDataHandler.parseICAL = function(input) {
    return input;
  };

  module.exports = CalendarDataHandler;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('sax/calendar_data_handler'), Caldav] :
    [module, require('../caldav')]
));
