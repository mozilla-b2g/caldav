(function(module, ns) {

  var exports = module.exports;

  exports.Ical = ns.require('ical');
  exports.Responder = ns.require('responder');
  exports.Sax = ns.require('sax');
  exports.Template = ns.require('template');
  exports.Xhr = ns.require('xhr');
  exports.Request = ns.require('request');
  exports.Templates = ns.require('templates');

}.apply(
  this,
  (this.Caldav) ?
    [Caldav, Caldav] :
    [module, require('./caldav')]
));
