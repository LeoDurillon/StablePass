import { test, expect, describe } from "bun:test";

import { derivePasswordBytes } from "../../src/generator/kdf";

describe("kdf", () => {
  test("should derive password bytes", async () => {
    const passwordBytes = await derivePasswordBytes(
      "simple_password",
      "https://example.com",
      "user_secret",
      0,
    );

    expect(passwordBytes).toBeInstanceOf(Uint8Array);
    expect(passwordBytes.length).toBeGreaterThan(0);
  });

  test("should produce different bytes for different versions", async () => {
    const bytesV0 = await derivePasswordBytes(
      "simple_password",
      "https://example.com",
      "user_secret",
      0,
    );
    const bytesV1 = await derivePasswordBytes(
      "simple_password",
      "https://example.com",
      "user_secret",
      1,
    );

    expect(bytesV0).not.toEqual(bytesV1);
  });

  test("should produce different bytes for different domains", async () => {
    const bytesExample = await derivePasswordBytes(
      "simple_password",
      "https://example.com",
      "user_secret",
      0,
    );
    const bytesTest = await derivePasswordBytes(
      "simple_password",
      "https://test.com",
      "user_secret",
      0,
    );

    expect(bytesExample).not.toEqual(bytesTest);
  });

  test("should produce different bytes for different user secrets", async () => {
    const bytesSecret1 = await derivePasswordBytes(
      "simple_password",
      "https://example.com",
      "user_secret_1",
      0,
    );
    const bytesSecret2 = await derivePasswordBytes(
      "simple_password",
      "https://example.com",
      "user_secret_2",
      0,
    );

    expect(bytesSecret1).not.toEqual(bytesSecret2);
  });

  test("should produce the same bytes for the same inputs", async () => {
    const bytes1 = await derivePasswordBytes(
      "simple_password",
      "https://example.com",
      "user_secret",
      0,
    );
    const bytes2 = await derivePasswordBytes(
      "simple_password",
      "https://example.com",
      "user_secret",
      0,
    );

    expect(bytes1).toEqual(bytes2);
  });
});
