REPORTER := spec

.PHONY: test
test:
	./node_modules/mocha/bin/mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		--growl test/helper.js \
		test/webcals/sax/*_test.js \
		test/webcals/request/*_test.js \
		test/webcals/*_test.js

.PHONY: watch
FILES=
watch:
	./node_modules/mocha/bin/mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		--watch \
		--growl \
		test/helper.js $(FILES)
