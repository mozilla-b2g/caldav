(function(module, ns) {

  var exports = module.exports;

  exports.Responder = ns.require('responder');
  exports.Sax = ns.require('sax');
  exports.Template = ns.require('template');
  exports.QueryBuilder = ns.require('query_builder');
  exports.Xhr = ns.require('xhr');
  exports.Request = ns.require('request');
  exports.Connection = ns.require('connection');
  exports.Resources = ns.require('resources');
  exports.Http = ns.require('http');
  exports.OAuth2 = ns.require('oauth2');
  exports.Errors = ns.require('errors');

}.apply(
  this,
  (this.Caldav) ?
    [Caldav, Caldav] :
    [module, require('./caldav')]
));
