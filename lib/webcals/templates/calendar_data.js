(function(module, ns) {

  function CalendarData() {
    this.struct = {};
  }

  CalendarData.prototype = {

    /**
     * Appends a list of fields
     * to a given iCalendar field set.
     *
     * @param {String} type iCal fieldset (VTODO, VEVENT,...).
     */
    select: function(type, list) {
      var struct = this.struct;

      if (!(type in struct)) {
        struct[type] = [];
      }

      struct[type] = struct[type].concat(list);

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
              ['caldav', 'prop'],
              { name: value[i] }
            );
          }
        }
        output += template.tag(
          ['caldav', 'comp'],
          { name: tag },
          elementOutput
        );
        elementOutput = '';
      }

      return output;
    },

    /**
     * Renders CalendarData with a template.
     *
     * @param {WebCals.Template} template calendar to render.
     * @return {String} <calendardata /> xml output.
     */
    render: function(template) {
      var struct = this.struct;
      var output = template.tag(
        ['caldav', 'calendar-data'],
        template.tag(
          ['caldav', 'comp'],
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
  (this.Webcals) ?
    [Webcals('templates/calendar_data'), Webcals] :
    [module, require('../webcals')]
));
