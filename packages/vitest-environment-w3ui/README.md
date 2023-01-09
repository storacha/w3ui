# vitest-environment-w3ui

A utility package that exports a custom [Vitest test environment](https://vitest.dev/guide/environment.html).

This is a very thin wrapper around the default JSDOM vitest environment that also defines the `crypto` global, using Node's builtin `crypto.webcrypto` implementation.

Note that this package is not published to NPM, as it's only used when testing other packages in this repo.
