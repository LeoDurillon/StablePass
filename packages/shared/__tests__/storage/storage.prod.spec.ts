import { test, expect, describe } from "bun:test";

const mockSync = {
  get: () => Promise.resolve({}),
  set: () => Promise.resolve(),
};

// @ts-ignore
globalThis.chrome = {
  // @ts-ignore
  storage: { sync: mockSync },
  // @ts-ignore
  runtime: { getManifest: () => ({ name: "Password Extension" }) },
};

import { setupStorageApi } from "../../src/storage";

describe("Storage - Production Mode", () => {
  test("should return chrome.storage.sync", () => {
    expect(setupStorageApi()).toBe(mockSync); // same object reference
  });

  test("should return the same instance on subsequent calls", () => {
    expect(setupStorageApi()).toBe(setupStorageApi());
  });
});
