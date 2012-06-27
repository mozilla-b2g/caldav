(function(module, ns) {
  // Credit: Andreas Gal - I removed the callback / xhr logic

  // Iterate over all entries if x is an array, otherwise just call fn on x.

  /* Pattern for an individual entry: name:value */
  var ENTRY = /^([A-Za-z0-9-]+)((?:;[A-Za-z0-9-]+=(?:"[^"]+"|[^";:,]+)(?:,(?:"[^"]+"|[^";:,]+))*)*):(.*)$/;

  /* Pattern for an individual parameter: name=value[,value] */
  var PARAM = /;([A-Za-z0-9-]+)=((?:"[^"]+"|[^";:,]+)(?:,(?:"[^"]+"|[^";:,]+))*)/g;

  /* Pattern for an individual parameter value: value | "value" */
  var PARAM_VALUE = /,?("[^"]+"|[^";:,]+)/g;

  // Parse a calendar in iCal format.
  function ParseICal(text) {
    // Parse the text into an object graph
    var lines = text.replace(/\r/g, '').split('\n');
    var tos = Object.create(null);
    var stack = [tos];

    // Parse parameters for an entry. Foramt: <param>=<pvalue>[;...]
    function parseParams(params) {
      var map = Object.create(null);
      var param = PARAM.exec(params);
      while (param) {
        var values = [];
        var value = PARAM_VALUE.exec(param[2]);
        while (value) {
          values.push(value[1].replace(/^"(.*)"$/, '$1'));
          value = PARAM_VALUE.exec(param[2]);
        }
        map[param[1].toLowerCase()] = (values.length > 1 ? values : values[0]);
        param = PARAM.exec(params);
      }
      return map;
    }

    // Add a property to the current object. If a property with the same name
    // already exists, turn it into an array.
    function add(prop, value, params) {
      if (params)
        value = { parameters: parseParams(params), value: value };
      if (prop in tos) {
        var previous = tos[prop];
        if (previous instanceof Array) {
          previous.push(value);
          return;
        }
        value = [previous, value];
      }
      tos[prop] = value;
    }

    for (var n = 0; n < lines.length; ++n) {
      var line = lines[n];
      // check whether the line continues (next line stats with space or tab)
      var nextLine;
      while ((nextLine = lines[n+1]) && (nextLine[0] === ' ' || nextLine[0] === '\t')) {
        line += nextLine.substr(1);
        ++n;
        continue;
      }
      // parse the entry, format is 'PROPERTY:VALUE'
      var matches = ENTRY.exec(line);

      if (!matches) {
        throw new Error('invalid format');
      }

      var prop = matches[1].toLowerCase();
      var params = matches[2];
      var value = matches[3];
      switch (prop) {
      case 'begin':
        var obj = Object.create(null);
        add(value.toLowerCase(), obj);
        stack.push(tos = obj);
        break;
      case 'end':
        stack.pop();
        tos = stack[stack.length - 1];
        if (stack.length == 1) {
          var cal = stack[0];
          if (typeof cal.vcalendar !== 'object' || cal.vcalendar instanceof Array) {
            throw new Error('single vcalendar object expected');
          }

          return cal.vcalendar;
        }
        break;
      default:
        add(prop, value, params);
        break;
      }
    }
    throw new Error('unexpected end of file');
  }

  function Value(v) {
    return (typeof v !== 'object') ? v : v.value;
  }

  function Parameter(v, name) {
    if (typeof v !== 'object')
      return undefined;
    return v.parameters[name];
  }

  // Parse a time specification.
  function ParseDateTime(v) {
    var dt = Value(v);
    if (Parameter(v, 'VALUE') === 'DATE') {
      // 20081202
      return new Date(dt.substr(0, 4), dt.substr(4, 2), dt.substr(6, 2));
    }
    v = Value(v);
    // 20120426T130000Z
    var year = dt.substr(0, 4);
    var month = dt.substr(4, 2) - 1;
    var day = dt.substr(6, 2);
    var hour = dt.substr(9, 2);
    var min = dt.substr(11, 2);
    var sec = dt.substr(13, 2);
    if (dt[15] == 'Z') {
      return new Date(Date.UTC(year, month, day, hour, min, sec));
    }
    return new Date(year, month, day, hour, min, sec);
  }

  module.exports = ParseICal;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('ical'), Webcals] :
    [module, require('./webcals')]
));

