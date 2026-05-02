/// <reference lib="dom" />
import { test, expect, describe, beforeEach } from "bun:test";

// @ts-ignore
globalThis.chrome = {
  storage: { sync: {} },
  runtime: { getManifest: () => ({ name: "Password Extension (debug)" }) },
};

import { setupStorageApi } from "../../src/storage";

describe("Storage - Debug Mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("should return the same instance on subsequent calls", () => {
    const s1 = setupStorageApi();
    const s2 = setupStorageApi();
    expect(s1).toBe(s2); // referential equality — caching works
  });

  test("get should return the value stored in localStorage", async () => {
    localStorage.setItem("my_key", JSON.stringify("my_value"));
    const result = await setupStorageApi().get("my_key");
    expect(result).toEqual({ my_key: "my_value" });
  });

  test("get should return undefined for a missing key", async () => {
    const result = await setupStorageApi().get("missing_key");
    expect(result).toEqual({ missing_key: undefined });
  });

  test("set should write each item as JSON to localStorage", async () => {
    await setupStorageApi().set({ key1: "hello", key2: 42 });
    expect(localStorage.getItem("key1")).toBe(JSON.stringify("hello"));
    expect(localStorage.getItem("key2")).toBe(JSON.stringify(42));
  });
});
