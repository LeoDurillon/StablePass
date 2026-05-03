import { describe, test, expect } from "bun:test";
import { getActiveTabUrl } from "../src/tabs";

describe("Tabs API", () => {
  test("should throw an error if no browser API is found", () => {
    // @ts-ignore
    delete globalThis.browser;
    // @ts-ignore
    delete globalThis.chrome;
    // No need reject as setupStorageApi is not async, it will throw immediately
    expect(() => getActiveTabUrl()).toThrow("No browser API found");
  });

  test("should throw an error if no active tab is found", async () => {
    // @ts-ignore
    globalThis.chrome = {
      // @ts-ignore
      tabs: {
        query: async () => [],
      },
    };
    expect(getActiveTabUrl()).rejects.toThrow("No active tab found");
  });

  test("should throw an error if active tab has no URL", async () => {
    // @ts-ignore
    globalThis.chrome = {
      tabs: {
        // @ts-ignore
        query: async () => [{ id: 1 }],
      },
    };
    expect(getActiveTabUrl()).rejects.toThrow("Active tab has no URL");
  });

  test("should return the URL of the active tab", async () => {
    // @ts-ignore
    globalThis.chrome = {
      tabs: {
        // @ts-ignore
        query: async () => [{ id: 1, url: "https://example.com" }],
      },
    };
    const url = await getActiveTabUrl();
    expect(url).toBeInstanceOf(URL);
    expect(url.href).toBe("https://example.com/");
  });
});
