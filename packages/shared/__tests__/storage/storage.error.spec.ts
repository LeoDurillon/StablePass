import { test, expect, describe } from "bun:test";
// No chrome or browser global — intentionally bare

import { setupStorageApi } from "../../src/storage";

describe("Storage - No Browser API", () => {
  test("should throw when no browser API is available", () => {
    expect(() => setupStorageApi()).toThrow("No browser API found");
  });
});
