/**
@namespace
*/
(function(module, ns) {
  var Template = ns.require('template');

  /**
   * Builds a node of a calendar-data or filter xml element.
   *
   * @param {QueryBuilder} builder instance.
   * @param {String} name component/prop name (like RRULE/VEVENT).
   * @param {Boolean} isProp is this node a property tag?
   */
  function Node(builder, name, isProp) {
    this.name = name;
    this.builder = builder;
    this.isProp = !!isProp;

    this.comps = Object.create(null);
    this.props = Object.create(null);
  }

  Node.prototype = {

    /**
     * Hook for adding custom node content.
     * (for unsupported or custom filters)
     *
     * Usually you never want to use this.
     *
     * @type {Null|Array}
     */
    content: null,

    /**
     * Appends custom string content into node.
     *
     * @param {String} string content.
     */
    appendString: function(string) {
      if (!this.content) {
        this.content = [];
      }

      if (typeof(string) !== 'string') {
        string = string.toString();
      }

      this.content.push(string);
    },

    _timeRange: null,

    /**
     * Adds a time range element to the node.
     *
     * Example:
     *
     *    var node;
     *
     *    // key/values not validated or converted
     *    // but directly piped into the time-range element.
     *    node.setTimeRange({
     *      start: '20060104T000000Z',
     *      end: '20060105T000000Z'
     *    });
     *
     *    // when null removes element
     *    node.setTimeRange(null);
     *
     * @param {Object|Null} range time range or null to remove.
     */
    setTimeRange: function(range) {
      this._timeRange = range;
    },

    /**
     * Removes a property from the output.
     * @param {String} name prop.
     */
    removeProp: function(name) {
      delete this.props[name];
    },

    /**
     * Removes a component from the output.
     *
     * @param {String} name comp.
     */
    removeComp: function(name) {
      delete this.comps[name];
    },

    _addNodes: function(type, nodes) {
      // return value when is array
      var result = this;

      if (!Array.isArray(nodes)) {
        // clear out the return value as we will
        // now use the first node.
        result = null;
      }

      nodes = (Array.isArray(nodes)) ? nodes : [nodes];

      var idx = 0;
      var len = nodes.length;
      var name;
      var node;

      for (; idx < len; idx++) {
        name = nodes[idx];
        node = new Node(this.builder, name, type === 'props');
        this[type][name] = node;
      }

      // when we where not given an array of nodes
      // assume we want one specific one so set that
      // as the return value.
      if (!result)
        result = node;

      return result;
    },

    /**
     * Adds one or more props.
     * If property already exists will not add
     * duplicates but return the existing property.
     *
     * @param {String|Array[String]} prop one or more properties to add.
     * @return {Node|Self} returns a node or self when given an array.
     */
    prop: function(prop) {
      return this._addNodes('props', prop);
    },

    /**
     * Adds one or more comp.
     * If comp already exists will not add
     * duplicates but return the existing comp.
     *
     * @param {String|Array[String]} comp one or more components to add.
     * @return {Node|Self} returns a node or self when given an array.
     */
    comp: function(comp) {
      return this._addNodes('comps', comp);
    },

    xmlAttributes: function() {
      return { name: this.name };
    },

    /**
     * Transform tree into a string.
     *
     * NOTE: order is not preserved at all here.
     *       It is highly unlikely that order is a
     *       factor for calendar-data or filter
     *       but this is fair warning for other uses.
     */
    toString: function() {
      var content = '';
      var key;
      var template = this.builder.template;

      if (this._timeRange) {
        content += template.tag(
          ['caldav', 'time-range'],
          this._timeRange
        );
      }

      // render out children
      for (key in this.props) {
        content += this.props[key].toString();
      }

      for (key in this.comps) {
        content += this.comps[key].toString();
      }

      if (this.content) {
        content += this.content.join('');
      }

      // determine the tag name
      var tag;
      if (this.isProp) {
        tag = this.builder.propTag;
      } else {
        tag = this.builder.compTag;
      }

      // build the xml element and return it.
      return template.tag(
        tag,
        this.xmlAttributes(),
        content
      );
    }
  };

  /**
   * Query builder can be used to build xml document fragments
   * for calendar-data & calendar-filter.
   * (and any other xml document with a similar structure)
   *
   * Options:
   *  - template: (Caldav.Template instance)
   *  - tag: container tag (like 'calendar-data')
   *  - attributes: attributes for root
   *  - compTag: name of comp[onent] tag name (like 'comp')
   *  - propTag: name of property tag (like 'prop')
   *
   * @param {Object} options query builder options.
   */
  function QueryBuilder(options) {
    if (!options)
      options = {};

    if (!(options.template instanceof Template)) {
      throw new TypeError(
        '.template must be an instance' +
        ' of Caldav.Template given "' + options.template + '"'
      );
    }

    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }
  }

  QueryBuilder.prototype = {
    tag: ['caldav', 'calendar-data'],

    compTag: ['caldav', 'comp'],

    propTag: ['caldav', 'prop'],

    attributes: null,

    _limitRecurrenceSet: null,

    /**
     * Adds the recurrence set limit child to the query.
     * Directly maps to the caldav 'limit-recurrence-set' element.
     *
     * Examples:
     *
     *    var builder;
     *
     *    // no validation or formatting is done.
     *    builder.setRecurrenceSetLimit({
     *      start: '20060103T000000Z',
     *      end: '20060103T000000Z'
     *    });
     *
     *    // use null to clear value
     *    builder.setRecurrenceSetLimit(null);
     *
     * @param {Object|Null} limit see above.
     */
    setRecurrenceSetLimit: function(limit) {
      this._limitRecurrenceSet = limit;
    },

    /**
     * @param {String} name component name (like VCALENDAR).
     * @return {QueryBuilder.Node} node instance.
     */
    setComp: function(name) {
      return this._compRoot = new Node(this, name);
    },

    /**
     * Returns the root node of the document fragment.
     */
    getComp: function() {
      return this._compRoot;
    },

    toString: function() {
      var content = '';
      var comp = this.getComp();

      if (this._limitRecurrenceSet) {
        content += this.template.tag(
          ['caldav', 'limit-recurrence-set'],
          this._limitRecurrenceSet
        );
      }

      if (comp) {
        content += comp.toString();
      }

      return this.template.tag(
        this.tag,
        this.attributes,
        content
      );
    }

  };

  QueryBuilder.Node = Node;
  module.exports = QueryBuilder;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('query_builder'), Caldav] :
    [module, require('./caldav')]
));

