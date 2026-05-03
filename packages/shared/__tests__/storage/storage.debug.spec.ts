/// <reference lib="dom" />
import { test, expect, describe, jest } from "bun:test";

const mockSync = {
  get: jest.fn(() => Promise.resolve({})),
  set: jest.fn(() => Promise.resolve()),
};

// @ts-ignore
globalThis.chrome = {
  // @ts-ignore
  storage: { sync: {}, local: mockSync },
  // @ts-ignore
  runtime: { getManifest: () => ({ name: "Password Extension (debug)" }) },
};

import { setupStorageApi } from "../../src/storage";

describe("Storage - Debug Mode", () => {
  test("should return the same instance on subsequent calls", () => {
    const s1 = setupStorageApi();
    const s2 = setupStorageApi();
    expect(s1).toBe(s2); // referential equality — caching works
  });

  test("get should return the value stored in localStorage", async () => {
    mockSync.get.mockResolvedValueOnce({ my_key: "my_value" });
    const result = await setupStorageApi().get("my_key");
    expect(result).toEqual({ my_key: "my_value" });
  });

  test("get should return undefined for a missing key", async () => {
    mockSync.get.mockResolvedValueOnce({ missing_key: undefined });
    const result = await setupStorageApi().get("missing_key");
    expect(result).toEqual({ missing_key: undefined });
  });
});
