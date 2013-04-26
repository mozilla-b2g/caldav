REPORTER=spec
WEB_FILE=caldav.js
VENDOR=./vendor/
LIB_ROOT=./lib/caldav

.PHONY: package
package: test-agent-config
	rm -Rf $(VENDOR)/
	rm -f $(WEB_FILE)
	touch $(WEB_FILE)
	mkdir $(VENDOR)
	cp ./lib/sax.js $(VENDOR)

	echo '/* sax js - LICENSE: https://github.com/isaacs/sax-js/blob/master/LICENSE */' >> $(WEB_FILE)
	cat $(VENDOR)/sax.js >> $(WEB_FILE);
	echo ';' >> $(WEB_FILE)
	echo '/* caldav.js - https://github.com/mozilla-b2g/caldav */' >> $(WEB_FILE)
	cat $(LIB_ROOT)/caldav.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/responder.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/querystring.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/template.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/query_builder.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/xhr.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/oauth2.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/http/basic_auth.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/http/oauth2.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/connection.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax/base.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax/calendar_data_handler.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax/dav_response.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/errors.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/abstract.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/asset.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/propfind.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/calendar_query.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/calendar_home.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/resources.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/http/index.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/index.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax/index.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/resources/calendar.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/resources/index.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/index.js >> $(WEB_FILE)

test: test-node test-browser

.PHONY: test-browser
test-browser:
	./node_modules/test-agent/bin/js-test-agent test --reporter Spec

.PHONY: test-node
test-node:
	./node_modules/mocha/bin/mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		--growl test/helper.js \
		test/caldav/sax/*_test.js \
		test/caldav/http/*_test.js \
		test/caldav/request/*_test.js \
		test/caldav/*_test.js

TEST_AGENT_CONFIG=./test-agent/config.json
.PHONY: test-agent-config
test-agent-config:
	@rm -f $(TEST_AGENT_CONFIG)
	@touch $(TEST_AGENT_CONFIG)
	@rm -f /tmp/test-agent-config;
	# Build json array of all test files
	for d in test; \
	do \
		find $$d -name '*_test.js' | sed "s:$$d/:/$$d/:g"  >> /tmp/test-agent-config; \
	done;
	@echo '{"tests": [' >> $(TEST_AGENT_CONFIG)
	@cat /tmp/test-agent-config |  \
		sed 's:\(.*\):"\1":' | \
		sed -e ':a' -e 'N' -e '$$!ba' -e 's/\n/,\
	/g' >> $(TEST_AGENT_CONFIG);
	@echo '  ]}' >> $(TEST_AGENT_CONFIG);
	@echo "Built test ui config file: $(TEST_AGENT_CONFIG)"
	@rm -f /tmp/test-agent-config

.PHONY: watch
FILES=
watch:
	./node_modules/mocha/bin/mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		--watch \
		--growl \
		test/helper.js $(FILES)

.PHONY: test-server
test-server:
	./node_modules/test-agent/bin/js-test-agent server --growl
