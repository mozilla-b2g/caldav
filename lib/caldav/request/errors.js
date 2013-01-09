(function(module, ns) {

  function CaldavHttpError(code) {
    this.code = code;
    var message;
    switch(this.code) {
      case 401:
        message = 'Wrong username or/and password';
        break;
      case 404:
        message = 'Url not found';
        break;
      case 500:
        message = 'Server error';
        break;
      default:
        message = this.code;
    }
    Error.call(this, message);
  }

  CaldavHttpError.prototype = {
    __proto__: Error.prototype,
    constructor: CaldavHttpError
  }

  // Unauthenticated error for 
  // Google Calendar
  function UnauthenticatedError() {
    var message = "Wrong username or/and password";
    Error.call(this, message);
  }

  UnauthenticatedError.prototype = {
    __proto__: Error.prototype,
    constructor: UnauthenticatedError
  }

  module.exports = {
    CaldavHttpError: CaldavHttpError,
    UnauthenticatedError: UnauthenticatedError
  };

}.apply(
  this,
  (this.Caldav) ?
    [Caldav('request/errors'), Caldav] :
    [module, require('../caldav')]
));
