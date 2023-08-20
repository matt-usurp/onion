import { defineConfig as configure } from 'vitest/config';

export default configure({
  test: {
    globals: true,
    environment: 'node',

    include: [
      'src/**/*.test.{ts,tsx}',
    ],

    deps: {
      // "If your environment is node, Vitest will not resolve invalid named exports .."
      // We sadly have some packages that have broken named exports so we need this enabled.
      // @see https://github.com/vitest-dev/vitest/releases/tag/v0.26.0
      interopDefault: true,
    },

    coverage: {
      all: true,
      clean: true,
      skipFull: true,

      include: [
        'src/**/*.{ts,tsx}',
      ],

      exclude: [
        'src/environment/resolve.ts',
        'src/typing.ts',

        'src/**/*.test.{ts,tsx}',
      ],

      reportsDirectory: 'build/coverage',
      reporter: ['text', 'html'],

      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
});
