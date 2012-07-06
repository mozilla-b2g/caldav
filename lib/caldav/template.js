(function(module, ns) {

  function Template(root, rootAttrs) {
    if (typeof(rootAttrs) === 'undefined') {
      rootAttrs = {};
    }

    this.rootTag = root;
    this.rootAttrs = rootAttrs;
    this.activeNamespaces = {};
  }

  Template.prototype = {

    defaultNamespace: 'dav',
    doctype: '<?xml version="1.0" encoding="UTF-8"?>',

    _nsId: 0,

    xmlns: {
      dav: 'DAV:',
      calserver: 'http://calendarserver.org/ns/',
      ical: 'http://apple.com/ns/ical/',
      caldav: 'urn:ietf:params:xml:ns:caldav'
    },

    render: function(content) {
      var output = this.doctype;
      output += this.tag(this.rootTag, this.rootAttrs, content);

      return output;
    },

    /**
     * Registers an xml tag/namespace.
     *
     * @param {String} prefix xmlns.
     * @param {String} tag tag name.
     * @return {String} xml tag name.
     */
    _registerTag: function(prefix, tag) {
      if (prefix in this.xmlns) {
        prefix = this.xmlns[prefix];
      }

      if (prefix in this.activeNamespaces) {
        prefix = this.activeNamespaces[prefix];
      } else {
        var alias = 'N' + this._nsId++;
        this.activeNamespaces[prefix] = alias;
        this.rootAttrs['xmlns:' + alias] = prefix;
        prefix = alias;
      }

      return prefix + ':' + tag;
    },

    /**
     * Returns a xml string based on
     * input. Registers given xmlns on main
     * template. Always use this with render.
     *
     * @param {String|Array} tagDesc as a string defaults to
     *                               .defaultNamespace an array
     *                               takes a xmlns or an alias
     *                               defined in .xmlns.
     *
     * @param {Object} [attrs] optional attributes.
     * @param {String} content content of tag.
     * @return {String} xml tag output.
     */
    tag: function(tagDesc, attrs, content) {

      if (typeof(attrs) === 'string') {
        content = attrs;
        attrs = {};
      }

      if (typeof(content) === 'undefined') {
        content = false;
      }

      if (attrs && typeof(attrs.render) === 'function') {
        content = attrs.render(this);
        attrs = {};
      }

      if (typeof(tagDesc) === 'string') {
        tagDesc = [this.defaultNamespace, tagDesc];
      }

      var fullTag = this._registerTag(tagDesc[0], tagDesc[1]);
      var output = '';
      var key;

      output += '<' + fullTag + '';

      for (key in attrs) {
        output += ' ' + key + '="' + attrs[key] + '"';
      }

      if (content) {
        output += '>' + content + '</' + fullTag + '>';
      } else {
        output += ' />';
      }

      return output;
    }

  };

  module.exports = Template;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('template'), Caldav] :
    [module, require('./caldav')]
));
