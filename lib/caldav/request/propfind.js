(function(module, ns) {

  var Abstract = ns.require('request/abstract'),
      Template = ns.require('template'),
      DavResponse = ns.require('sax/dav_response');

  /**
   * Creates a propfind request.
   *
   * @param {String} url location to make request.
   * @param {Object} options options for propfind.
   */
  function Propfind(url, options) {
    Abstract.apply(this, arguments);

    this.template = new Template('propfind');
    this._props = [];
    this.sax.registerHandler(
      'DAV:/response',
      DavResponse
    );

    this.xhr.headers['Depth'] = 0;
    this.xhr.method = 'PROPFIND';
  }

  Propfind.prototype = {
    __proto__: Abstract.prototype,

    get depth() {
      return this.xhr.headers.Depth;
    },

    set depth(val) {
      this.xhr.headers.Depth = val;
    },

    /**
     * Adds property to request.
     *
     * @param {String|Array} tagDesc tag description.
     * @param {Object} [attr] optional tag attrs.
     * @param {Obj} [content] optional content.
     */
    prop: function(tagDesc, attr, content) {
      console.log('[propfind] PROP' + '\n' +
           JSON.stringify({
             tagDesc: tagDesc,
             attr: attr,
             content: content
           }) + '\n');
      this._props.push(this.template.tag(tagDesc, attr, content));
    },

    /**
     * Removes property from request.
     * Must use same arguments as 'prop' to remove prop.
     *
     * @param {String|Array} tagDesc tag description.
     * @param {Object} [attr] optional tag attrs.
     * @param {Obj} [content] optional content.
     */
    removeProp: function(tagDesc, attr, content) {
      var prop = this.template.tag(tagDesc, attr, content);
      var idx = this._props.indexOf(prop);

      if (idx !== -1) {
        this._props.splice(idx, 1);
        return true;
      }
      return false;
    },

    /**
     * Checks if prop has been added to the request.
     *
     * @param {String|Array} tagDesc tag description.
     * @param {Object} [attr] optional tag attrs.
     * @param {Obj} [content] optional content.
     */
    hasProp: function(tagDesc, attr, content) {
      var prop = this.template.tag(tagDesc, attr, content);
      return this._props.indexOf(prop) !== -1;
    },

    _createPayload: function() {
      var content = this.template.tag('prop', this._props.join(''));
      console.log('[propfind] CREATE_PAYLOAD' + '\n' +
           JSON.stringify(content) + '\n');
      return this.template.render(content);
    },

    _processResult: function(req, callback) {
      if ('multistatus' in this.sax.root) {
        callback(null, this.sax.root.multistatus, req);
      } else {
        //XXX: Improve error handling
        callback(
          new Error('unexpected xml result'),
          this.sax.root, req
        );
      }
    }

  };

  module.exports = Propfind;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/propfind'), Caldav] :
    [module, require('../caldav')]
));
