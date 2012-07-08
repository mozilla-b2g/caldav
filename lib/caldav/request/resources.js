(function(module, ns) {

  var Propfind = ns.require('request/propfind');

  function Resources(connection, options) {
    Propfind.apply(this, arguments);

    this._resources = {};
    this.depth = 1;
  }

  Resources.prototype = {
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
      var resources;

      if ('multistatus' in this.sax.root) {
        root = this.sax.root.multistatus;

        for (url in root) {
          collection = root[url];

          resources = collection.resourcetype;

          if (resources.value.forEach) {

            resources.value.forEach(function(type) {
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

  module.exports = Resources;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/resources'), Caldav] :
    [module, require('../caldav')]
));
