(function(module, ns) {

  Errors = {};

  /**
   * Errors typically are for front-end routing purposes so the important
   * part really is just the name and (maybe) the symbol... These are really
   * intended to be consumed by name... So once a name has been assigned it
   * should never be modified.
   */
  [
    { symbol: 'Authentication', name: 'authentication' },
    { symbol: 'InvalidEntrypoint', name: 'invalid-entrypoint' },
    { symbol: 'ServerFailure', name: 'server-failure' },
    { symbol: 'Unknown', name: 'unknown' }
  ].forEach(function createError(def) {
    var obj = Errors[def.symbol] = function(message) {
      this.message = message;
      this.name = 'caldav-' + def.name;

      try {
        throw new Error();
      } catch (e) {
        this.stack = e.stack;
      }
    };

    // just so instanceof Error works
    obj.prototype = Object.create(Error.prototype);
  });

  module.exports = Errors;

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('errors'), Caldav] :
    [module, require('./caldav')]
));

