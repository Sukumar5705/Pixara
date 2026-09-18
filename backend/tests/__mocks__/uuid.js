/**
 * tests/__mocks__/uuid.js
 * CJS-compatible uuid mock for Jest.
 * Produces unique deterministic v4-style strings that won't clash in tests.
 */
let counter = 0;

const v4 = () => {
  counter++;
  const hex = counter.toString(16).padStart(8, "0");
  return `${hex}-0000-4000-8000-000000000000`;
};

module.exports = { v4 };
