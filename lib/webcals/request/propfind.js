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

    this.xhr.headers['Depth'] = this.depth;
    this.xhr.method = 'PROPFIND';
  }

  Propfind.prototype = {
    __proto__: Abstract.prototype,

    depth: 0,

    /**
     * Adds property to request.
     *
     * @param {String|Array} tagDesc tag description.
     * @param {Object} [attr] optional tag attrs.
     */
    prop: function(tagDesc, attr) {
      this._props.push(this.template.tag(tagDesc, attr));
    },

    _createPayload: function() {
      var content = this.template.tag('prop', this._props.join(''));
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
  (this.Webcals) ?
    [Webcals('request/abstract'), Webcals] :
    [module, require('../webcals')]
));
