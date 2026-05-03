import { test, expect, describe, mock, jest, spyOn, beforeEach } from "bun:test";
import { USER_SECRET_KEY } from "../src/consts";

import * as SecretModule from "../src/secrets";
import { setupStorageApi, type Storage } from "../src/storage";

const mockedStorage = {
  get: jest.fn(),
  set: jest.fn(),
};

mock.module("../src/storage", () => ({
  setupStorageApi: jest.fn().mockImplementation(() => mockedStorage),
}));

describe("User secrets", () => {
  let storage: Storage;

  beforeEach(async () => {
    jest.resetAllMocks();
    storage = setupStorageApi();
    await SecretModule.clearUserSecret();
  });

  test("should retrieve user secret", async () => {
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValueOnce({ [USER_SECRET_KEY]: "mocked_user_secret" });
    const userSecret = await SecretModule.getUserSecret();
    expect(userSecret).toBe("mocked_user_secret");
  });

  test("should set user secret if it does not exist", async () => {
    // Simulate no user secret in storage
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValueOnce({ [USER_SECRET_KEY]: undefined });
    const generateSpy = spyOn(SecretModule, "generateUserSecret").mockReturnValueOnce(
      "generated_user_secret",
    );

    const userSecret = await SecretModule.getUserSecret();
    expect(userSecret).toBeString();
    expect(generateSpy).toHaveBeenCalled();
    expect(storage.set).toHaveBeenCalledWith({
      [USER_SECRET_KEY]: "generated_user_secret",
    });
  });

  test("should generate a new user secret", () => {
    const secret = SecretModule.generateUserSecret();
    expect(secret).toBeString();
    expect(secret).toHaveLength(64); // 32 bytes in hex is 64 characters
    // Check if it's a valid hex string
    expect(/^[0-9a-f]+$/.test(secret)).toBe(true);
  });

  test("should return the same user secret on subsequent calls", async () => {
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValue({ [USER_SECRET_KEY]: "consistent_user_secret" });
    const firstCall = await SecretModule.getUserSecret();
    const secondCall = await SecretModule.getUserSecret();
    expect(firstCall).toBe("consistent_user_secret");
    expect(secondCall).toBe("consistent_user_secret");
  });

  test("should not call storage.get on subsequent calls after the first retrieval", async () => {
    mock.clearAllMocks();
    const storageSpy = spyOn(mockedStorage, "get").mockResolvedValue({
      [USER_SECRET_KEY]: "cached_user_secret",
    });
    const firstCall = SecretModule.getUserSecret(); // First call to retrieve and cache the secret
    const secondCall = await SecretModule.getUserSecret(); // First call to retrieve and cache the secret
    expect(storageSpy).toHaveBeenCalledTimes(1);
    expect(firstCall).resolves.toBe(secondCall);
  });

  test("should clear user secret", async () => {
    // @ts-expect-error - We know this is the correct shape for the test
    storage.get.mockResolvedValueOnce({ [USER_SECRET_KEY]: "to_be_cleared" });
    const userSecret = await SecretModule.getUserSecret();
    expect(userSecret).toBe("to_be_cleared");

    await SecretModule.clearUserSecret();
    expect(storage.set).toHaveBeenCalledWith({ [USER_SECRET_KEY]: undefined });

    spyOn(mockedStorage, "get").mockResolvedValue({
      [USER_SECRET_KEY]: undefined,
    });

    // After clearing, it should generate a new secret
    const generateSpy = spyOn(SecretModule, "generateUserSecret").mockReturnValueOnce(
      "new_generated_secret",
    );
    const newUserSecret = await SecretModule.getUserSecret();
    expect(newUserSecret).toBe("new_generated_secret");
    expect(generateSpy).toHaveBeenCalled();
  });
});
