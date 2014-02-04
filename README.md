# CalDAV

Basis for all caldav operations in b2g calendar app but designed from
ground up as a general purpose caldav library.

Tested against firefox nightly / b2g nightly / nodejs.
Should work under any modern browser but unless your browser
can support cross domain requests cros headers its usefulness
will be limited.

### Server-specific tests

We have a tiny collection of tests which can be pointed at specific servers. In order to run these, create a file called `servers.json` in `test/servers` following the JSON format in `test/servers/servers.json.tpl`. Then do

```
./index.js -s <server>
```

to run all of the tests!
