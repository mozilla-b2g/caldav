(function(module, ns) {

  function CalendarData() {
    this._hasItems = false;
    this.struct = {};
  }

  CalendarData.prototype = {

    rootName: 'calendar-data',
    compName: 'comp',
    propName: 'prop',

    /**
     * Appends a list of fields
     * to a given iCalendar field set.
     *
     * @param {String} type iCal fieldset (VTODO, VEVENT,...).
     */
    select: function(type, list) {
      if (typeof(list) === 'undefined') {
        list = true;
      }

      var struct = this.struct;
      this._hasItems = true;

      if (!(type in struct)) {
        struct[type] = [];
      }

      if (list instanceof Array) {
        struct[type] = struct[type].concat(list);
      } else {
        struct[type] = list;
      }

      return this;
    },

    /**
     * Accepts an object full of arrays
     * recuse when encountering another object.
     */
    _renderFieldset: function(template, element) {
      var tag;
      var value;
      var i;
      var output = '';
      var elementOutput = '';

      for (tag in element) {
        value = element[tag];
        for (i = 0; i < value.length; i++) {
          if (typeof(value[i]) === 'object') {
            elementOutput += this._renderFieldset(
              template,
              value[i]
            );
          } else {
            elementOutput += template.tag(
              ['caldav', this.propName],
              { name: value[i] }
            );
          }
        }
        output += template.tag(
          ['caldav', this.compName],
          { name: tag },
          elementOutput || null
        );
        elementOutput = '';
      }

      return output;
    },

    _defaultRender: function(template) {
      return template.tag(['caldav', this.rootName]);
    },

    /**
     * Renders CalendarData with a template.
     *
     * @param {WebCals.Template} template calendar to render.
     * @return {String} <calendardata /> xml output.
     */
    render: function(template) {
      if (!this._hasItems) {
        return this._defaultRender(template);
      }

      var struct = this.struct;
      var output = template.tag(
        ['caldav', this.rootName],
        template.tag(
          ['caldav', this.compName],
          { name: 'VCALENDAR' },
          this._renderFieldset(template, struct)
        )
      );

      return output;
    }
  };


  module.exports = CalendarData;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('templates/calendar_data'), Caldav] :
    [module, require('../caldav')]
));
