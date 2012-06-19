(function(module, ns) {

  var Base = {

    name: 'base',

    tagField: 'local',

    /**
     * Creates a new object with base as its prototype.
     * Adds ._super to object as convenience prop to access
     * the parents functions.
     *
     * @param {Object} obj function overrides.
     * @return {Object} new object.
     */
    create: function(obj) {
      var key;
      var child = Object.create(this);

      child._super = this;

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          child[key] = obj[key];
        }
      }

      return child;
    },

    onopentag: function(data, handler) {
      var current = this.current;
      var name = data[handler.tagField];

      this.stack.push(this.current);

      if (name in current) {
        var next = {};

        if (!(current[name] instanceof Array)) {
          current[name] = [current[name]];
        }

        current[name].push(next);

        this.current = next;
      } else {
        this.current = current[name] = {};
      }
    },

    ontext: function(data) {
      this.current.value = data;
    },

    onclosetag: function() {
      this.current = this.stack.pop();
    },

    onend: function() {
      this.emit('complete', this.root);
    }
  };

  module.exports = Base;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('sax/base'), Webcals] :
    [module, require('../webcals')]
));
