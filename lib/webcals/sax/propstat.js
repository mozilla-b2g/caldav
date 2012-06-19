(function(module, ns) {
  var Responder = ns.require('responder');

  function Propstat(sax, complete) {

    function onopen() {

    }

    function onclose() {

    }

    function ontext() {

    }

    sax.on('tagopen', onopen);
    sax.on('tagclose', ontext);
    sax.on('text', ontext);
  }

  module.exports = Propstat;

}.apply(
  this,
  (this.CalDav) ?
    [CalDav('sax/propstat'), CalDav] :
    [module, require('../webcals')]
));
