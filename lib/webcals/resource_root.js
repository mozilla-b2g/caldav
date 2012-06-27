(function(module, ns) {

  function ResourceRoot() {

  }

  module.exports = ResourceRoot;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('resource_root'), Webcals] :
    [module, require('./webcals')]
));
