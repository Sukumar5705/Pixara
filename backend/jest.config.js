/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 30000,
  forceExit: true,

  // Map uuid to its CommonJS-compatible dist so Jest can require() it.
  // uuid v14 ships ESM in dist-node but also has a CJS build at dist/cjs.
  moduleNameMapper: {
    "^uuid$": "<rootDir>/tests/__mocks__/uuid.js",
  },
};
