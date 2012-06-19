REPORTER := spec

.PHONY: test
test:
	./node_modules/mocha/bin/mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		--growl test/helper.js \
		test/caldav/*_test.js

.PHONY: watch
FILES=
watch:
	./node_modules/mocha/bin/mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		--watch \
		--growl \
		test/helper.js $(FILES)
