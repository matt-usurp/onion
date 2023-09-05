export DIR_WORKSPACE := build/workspace

.PHONY: default
default:

# --
# -- Commit Linting
# --

.PHONY: \
	commit.test

commit.test:
	echo "chore: foobar" | npx --no-install commitlint --verbose

# --
# -- Code Formatting
# --

.PHONY: \
	code \
	code.fix

code:
	npx eslint \
		--cache \
		--cache-location .eslintcache \
		--format codeframe \
			./src

code.fix:
	npx eslint \
		--cache \
		--cache-location .eslintcache \
		--fix \
		--format codeframe \
			./src

# --
# -- Testing
# --

.PHONY: \
	test \
	test.watch \
	test.watch.coverage \
	test.coverage.open

test:
	npx vitest run \
		--config vitest.config.ts \
		--coverage \
		--reporter verbose \
		--segfault-retry 3

test.watch:
	npx vitest watch \
		--config vitest.config.ts \
		--reporter verbose \
		--segfault-retry 3

test.watch.coverage:
	npx vitest watch \
		--config vitest.config.ts \
		--coverage \
		--reporter verbose \
		--segfault-retry 3

test.coverage.open:
	open build/coverage/index.html

# --
# -- Building
# --

.PHONY: \
	build \
	build.clean \
	build.setup \
	build.compile \
	build.compile.verify \
	build.compile.clean \
	build.package \
	build.package.verify \
	build.package.install

build: \
	build.clean \
	build.setup \
	build.compile \
	build.compile.verify \
	build.compile.clean \
	build.package \
	build.package.verify

build.clean:
	test ! -z "${DIR_WORKSPACE}"
	rm -rf ${DIR_WORKSPACE}/*

build.setup:
	test ! -z "${DIR_WORKSPACE}"
	mkdir -p ${DIR_WORKSPACE}

build.compile:
	npx tsc -p build/tsconfig.json

build.compile.verify:
	test ! -z "${DIR_WORKSPACE}"

	test -d ${DIR_WORKSPACE}/component
	test -f ${DIR_WORKSPACE}/component/composition.js
	test -f ${DIR_WORKSPACE}/component/layer.js
	test -f ${DIR_WORKSPACE}/component/terminus.js
	test -f ${DIR_WORKSPACE}/component/utility.js

	test -f ${DIR_WORKSPACE}/index.js
	test -f ${DIR_WORKSPACE}/index.d.ts

build.compile.clean:
	find ${DIR_WORKSPACE} -type f -name "*.test.js" -delete
	find ${DIR_WORKSPACE} -type f -name "*.test.d.ts" -delete

build.package:
	cp package.json ${DIR_WORKSPACE}/package.json
	cp package-lock.json ${DIR_WORKSPACE}/package-lock.json
	cp README.md ${DIR_WORKSPACE}/README.md

build.package.verify:
	test -f ${DIR_WORKSPACE}/package.json
	test -f ${DIR_WORKSPACE}/package-lock.json
	test -f ${DIR_WORKSPACE}/README.md
