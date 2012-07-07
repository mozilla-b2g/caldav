(function(module, ns) {

  var Propfind = ns.require('request/propfind');

  function ResourceFinder(connection, options) {
    Propfind.apply(this, arguments);

    this._resources = {};
    this.depth = 1;
  }

  ResourceFinder.prototype = {
    __proto__: Propfind.prototype,

    addResource: function(name, handler) {
      this._resources[name] = handler;
    },

    _processResult: function(req, callback) {
      var results = {};
      var url;
      var root;
      var collection;
      var self = this;

      if ('multistatus' in this.sax.root) {
        root = this.sax.root.multistatus;

        for (url in root) {
          collection = root[url];

          if ('resourcetype' in collection) {
            collection.resourcetype.forEach(function(type) {
              if (type in self._resources) {

                if (!(type in results)) {
                  results[type] = {};
                }

                results[type][url] = new self._resources[type](
                  self.connection,
                  collection
                );
              }
            });
          }
        }

        callback(null, results, req);

      } else {
        //XXX: Improve error handling
        callback(
          new Error('unexpected xml result'),
          this.sax.root, req
        );
      }
    }

  };

  module.exports = ResourceFinder;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/resources'), Caldav] :
    [module, require('../caldav')]
));
