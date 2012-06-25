(function(module, ns) {

  function Abstract() {

  }

  module.exports = Abstract;

}.apply(
  this,
  (this.Webcals) ?
    [Webcals('request/abstract'), Webcals] :
    [module, require('../webcals')]
));
