/**
@namespace
*/
(function(module, ns) {

  /**
   * Represents a (Web/Cal)Dav resource type.
   *
   * @param {Object} options public options on prototype.
   */
  function Calendar(options) {

  }

  Calendar.prototype = {

    /**
     * location of calendar resource
     */
    url: null,

    /**
     * color of calendar as defined by ical spec
     */
    color: null,

    /**
     * displayname as defined by webdav spec
     */
    name: null,

    /**
     * description of calendar as described by caldav spec
     */
    description: null,

    /**
     * Available ical components (like VEVENT)
     * @type Array
     */
    componentSet: null,

    /**
     * change tag (as defined by calendarserver spec)
     * used to determine if a change has occurred to this
     * calendar resource.
     */
    ctag: null,

    /**
     * Resource types of this resource will
     * always contain 'calendar'
     * @type Array
     */
    resourcetype: null,

    /**
     * Set of privileges available to the user.
     */
    privilegeSet: null,

    /**
     * Creates a query request for this calendar resource.
     *
     * @return {CalDav.Request.CalendarQuery} query object.
     */
    createQuery: function() {

    }

  };

  module.exports = Calendar;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('resources/calendar'), Caldav] :
    [module, require('../caldav')]
));
