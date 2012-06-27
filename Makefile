REPORTER=spec
WEB_FILE=webcals.js
VENDOR=./vendor/
LIB_ROOT=./lib/webcals

.PHONY: package
package: test-agent-config
	rm -Rf $(VENDOR)/
	rm -f $(WEB_FILE)
	touch $(WEB_FILE)
	mkdir $(VENDOR)
	cp ./node_modules/mocha/mocha.js $(VENDOR)
	cp ./node_modules/mocha/mocha.css $(VENDOR)
	cp ./node_modules/chai/chai.js $(VENDOR)
	cp ./node_modules/sax/lib/sax.js $(VENDOR)
	cp ./node_modules/test-agent/test-agent.js $(VENDOR)
	cp ./node_modules/test-agent/test-agent.css $(VENDOR)


	cat $(VENDOR)/sax.js >> $(WEB_FILE)
	echo ';' >> $(WEB_FILE)
	cat $(LIB_ROOT)/webcals.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/responder.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/template.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/xhr.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/templates/calendar_data.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/templates/calendar_filter.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax/base.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax/dav_response.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/abstract.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/propfind.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/request/calendar_query.js >> $(WEB_FILE)

	cat $(LIB_ROOT)/request/index.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/sax/index.js >> $(WEB_FILE)
	cat $(LIB_ROOT)/templates/index.js >> $(WEB_FILE)
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
		test/webcals/sax/*_test.js \
		test/webcals/templates/*_test.js \
		test/webcals/request/*_test.js \
		test/webcals/*_test.js

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
