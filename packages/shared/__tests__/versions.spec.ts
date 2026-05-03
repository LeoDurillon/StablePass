import { describe, expect, mock, test, jest, beforeEach } from "bun:test";

const mockedStorage = {
  get: jest.fn(),
  set: jest.fn(),
};

mock.module("../src/storage", () => ({
  setupStorageApi: jest.fn().mockImplementation(() => mockedStorage),
}));

import * as VersionModule from "../src/versions";
import { VERSIONS_KEY } from "../src/consts";
import { setupStorageApi, type Storage } from "../src/storage";

describe("Version management", () => {
  let storage: Storage;

  beforeEach(() => {
    jest.resetAllMocks();
    storage = setupStorageApi();
  });

  test("should return the current version", async () => {
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValueOnce({ [VERSIONS_KEY]: { "example.com": 2 } });
    const version = await VersionModule.getVersion("example.com");
    expect(version).toBe(2);
  });

  test("should return null if no version exists for the domain", async () => {
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValueOnce({ [VERSIONS_KEY]: { "other.com": 1 } });
    const version = await VersionModule.getVersion("example.com");
    expect(version).toBeNull();
  });

  test("should increment the version for a domain", async () => {
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValueOnce({ [VERSIONS_KEY]: { "example.com": 2 } });
    const newVersion = await VersionModule.incrementVersion("example.com");
    expect(newVersion).toBe(3);
    expect(storage.set).toHaveBeenCalledWith({
      [VERSIONS_KEY]: { "example.com": 3 },
    });
  });

  test("should initialize version to 1 if it does not exist", async () => {
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValueOnce({ [VERSIONS_KEY]: {} });
    const newVersion = await VersionModule.incrementVersion("example.com");
    expect(newVersion).toBe(1);
    expect(storage.set).toHaveBeenCalledWith({
      [VERSIONS_KEY]: { "example.com": 1 },
    });
  });

  test("should set a specific version for a domain", async () => {
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValueOnce({ [VERSIONS_KEY]: { "example.com": 2 } });
    await VersionModule.setVersion("example.com", 5);
    expect(storage.set).toHaveBeenCalledWith({
      [VERSIONS_KEY]: { "example.com": 5 },
    });
  });
});
