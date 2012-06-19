var XHR = require('./lib/caldav/xhr.js');
var url, user, pass, domain;

function getBody(file) {
  return require('fs').readFileSync(
    __dirname + '/samples/' + file, 'utf8'
  );
}

domain = 'http://localdav.com';
uri = '/calendars/admin';
user = 'admin';
pass = 'admin';

function request(options) {
  var defaults = {
    user: user,
    password: pass,
    url: domain + uri + (options.uri || ''),
    headers: {
      Depth: 0
    }
  };

  if (typeof(options) === 'undefined') {
    options = {};
  }

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      defaults[key] = options[key];
    }
  }

  return new XHR(defaults);
}



function getProps() {

 var  body = '<?xml version="1.0" encoding="utf-8" ?>' +
  '<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">' +
   '<D:prop>' +
     '<C:calendar-home-set/>' +
     '<C:calendar-user-address-set/>' +
     '<C:schedule-inbox-URL/>' +
     '<C:schedule-outbox-URL/>' +
   '</D:prop>' +
  '</D:propfind>';


  var xhr = request({
    method: 'PROPFIND',
    data: body,
    headers: {
      'Depth': 0
    }
  });

  xhr.send(function(text, xhr) {
    console.log(xhr.responseText);
  });
}


function getCalenders() {
  var body = getBody('calendar-data');

  var xhr = request({
    url: domain + '/calendar/dav/james%40lightsofapollo.com/',
    method: 'REPORT',
    headers: {
      Depth: 1
    },
    data: body
  });

  xhr.send(function(text) {
    console.log(text);
  });
}


function checkResource() {
  var body = getBody('resource-type'),
      xhr;

  xhr = request({
    uri: '/default',
    method: 'PROPFIND',
    data: body
  });

  xhr.send(function(text) {
    console.log(text);
  });

}

checkResource();

//getCalenders();
//getProps();
