import { test, expect, describe, jest, beforeEach, mock, afterEach } from "bun:test";

import { derivePassword } from "../../src/generator/derive";
const mockPassword = "mocked_password";
mock.restore();

import { getVersion, incrementVersion } from "@stable-pass/shared";

describe("derive", () => {
  beforeEach(() => {
    mock.module("../../src/generator/kdf", () => ({
      derivePasswordBytes: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    }));
    mock.module("@stable-pass/shared", () => ({
      getUserSecret: jest.fn().mockResolvedValue("mocked_user_secret"),
      getVersion: jest.fn().mockResolvedValue(0),
      incrementVersion: jest.fn().mockResolvedValue(1),
    }));
    mock.module("../../src/generator/generator", () => ({
      PasswordGenerator: class {
        constructor(_: Uint8Array) {}
        generatePassword() {
          return mockPassword;
        }
      },
    }));
  });

  afterEach(() => {
    mock.restore();
    mock.clearAllMocks();
  });

  test("should derive a password", async () => {
    const password = await derivePassword("simple_password");

    expect(password).toBe(mockPassword);
  });

  test("should rotate the version and derive a new password", async () => {
    const password = await derivePassword("simple_password", true);
    expect(password).toBe(mockPassword);
    expect(incrementVersion).toHaveBeenCalledWith(window.location.origin);
  });

  test("should handle null version and set it to 0", async () => {
    mock.module("@stable-pass/shared", () => ({
      getVersion: jest.fn().mockResolvedValue(null),
      incrementVersion: jest.fn().mockResolvedValue(0),
    }));

    const password = await derivePassword("simple_password");
    expect(password).toBe(mockPassword);
    expect(getVersion).toHaveBeenCalled();
    expect(incrementVersion).toHaveBeenCalledWith(window.location.origin);
  });
});
