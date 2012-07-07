/**
@namespace
*/
(function(module, ns) {

  /**
   * Represents a (Web/Cal)Dav resource type.
   *
   * @param {Caldav.Connection} connection connection details.
   * @param {Object} options public options on prototype.
   */
  function Calendar(connection, options) {
    if (typeof(options) === 'undefined') {
      options = {};
    }

    if (options.url) {
      this.url = options.url;
    }

    this.updateFromServer(options);
  }

  Calendar.prototype = {

    _map: {
      'displayname': 'name',

      'calendar-color': 'color',

      'calendar-description': 'description',

      'getctag': 'ctag',

      'resourcetype': {
        field: 'resourcetype',
        defaults: []
      },

      'current-user-privilege-set': {
        field: 'privilegeSet',
        defaults: []
      }

    },

    /**
     * location of calendar resource
     */
    url: null,

    /**
     * displayname as defined by webdav spec
     * Maps to: displayname
     */
    name: null,

    /**
     * color of calendar as defined by ical spec
     * Maps to: calendar-color
     */
    color: null,

    /**
     * description of calendar as described by caldav spec
     * Maps to: calendar-description
     */
    description: null,

    /**
     * change tag (as defined by calendarserver spec)
     * used to determine if a change has occurred to this
     * calendar resource.
     *
     * Maps to: getctag
     */
    ctag: null,

    /**
     * Resource types of this resource will
     * always contain 'calendar'
     *
     * Maps to: resourcetype
     *
     * @type Array
     */
    resourcetype: null,

    /**
     * Set of privileges available to the user.
     *
     * Maps to: current-user-privilege-set
     */
    privilegeSet: null,

    /**
     * Updates calendar details from server.
     */
    updateFromServer: function(options) {
      var key;
      var defaultTo;
      var mapName;
      var value;
      var descriptor;

      if (typeof(options) === 'undefined') {
        options = {};
      }

      for (key in options) {
        if (options.hasOwnProperty(key)) {
          if (key in this._map) {
            descriptor = this._map[key];
            value = options[key];

            if (typeof(descriptor) === 'object') {
              defaultTo = descriptor.defaults;
              mapName = descriptor.field;
            } else {
              defaultTo = '';
              mapName = descriptor;
            }

            if (value.status !== '200') {
              this[mapName] = defaultTo;
            } else {
              this[mapName] = value.value;
            }

          }
        }
      }
    },

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
