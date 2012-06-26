(function(module, ns) {

  module.exports = {
    
  };

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('templates/propfind'), Webcals] :
    [module, require('../webcals')]
));
