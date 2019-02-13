/* eslint-env jest */

import * as lib from "./"

test("export something", () => {
  expect(Object.keys(lib).length).toBeGreaterThan(0)
})
