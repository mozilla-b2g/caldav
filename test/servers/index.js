#! /usr/bin/env node

/** imports */
var Mocha = require('mocha');
var fs = require('fs');
var fsPath = require('path');
var debug = require('debug')('cli');

/** server configurations */
var configurations = JSON.parse(require('fs').readFileSync(
  __dirname + '/servers.json', 'utf8'
));


var configTypes = Object.keys(configurations);
var program = require('commander');

/** default tests */
var tests = [
  'home_test.js',
  'resources_test.js',
  'query_test.js'
];

/** cli::setup */
program.option(
  '-s, --server <name>',
  'target server: ' +
  '[ ' + configTypes.join(', ') + ' ]'
);


program.on('--help', function() {
  console.log('  Logging:');
  console.log();
  console.log('    Use DEBUG=caldav:* to show all test logs');
  console.log();
});

program.parse(process.argv);

testEnv = {
  serverConfig: configurations[program.server],
  server: program.server
};

/** load tests */
var inputTests = program.args;

if (inputTests.length)
  tests = inputTests;

tests = tests.map(function(test) {
  if (test[0] !== '/') {
    test = fsPath.join(process.cwd(), test);
  }
  debug('loading', test);
  return test;
});

/** run mocha tests */
var mocha = new Mocha();
mocha.files = tests;
mocha.ui('tdd');
mocha.reporter(program.reporter || 'spec');
mocha.run(process.exit);
