(function(module, ns) {

  function ResourceRoot() {

  }

  module.exports = ResourceRoot;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('resource_root'), Caldav] :
    [module, require('./caldav')]
));
