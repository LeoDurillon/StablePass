import { test, expect, describe } from "bun:test";
import { PasswordGenerator } from "../../src/generator/generator";

describe("PasswordGenerator", () => {
  test("should generate a password of the correct length", () => {
    const bytes = new Uint8Array(100);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = i % 256;
    }

    const generator = new PasswordGenerator(bytes);
    const password = generator.generatePassword();
    expect(password.length).toBe(22);
  });

  test("should generate a password with the correct character sets", () => {
    const bytes = new Uint8Array(100);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = i % 256;
    }

    const generator = new PasswordGenerator(bytes);
    const password = generator.generatePassword();

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    expect(hasLowercase).toBe(true);
    expect(hasUppercase).toBe(true);
    expect(hasNumbers).toBe(true);
    expect(hasSpecial).toBe(true);
  });

  test("should generate the same password for the same byte stream", () => {
    const bytes = new Uint8Array(100);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = i % 256;
    }

    const generator1 = new PasswordGenerator(bytes);
    const generator2 = new PasswordGenerator(bytes);

    const password1 = generator1.generatePassword();
    const password2 = generator2.generatePassword();

    expect(password1).toBe(password2);
  });

  test("should handle short byte streams", () => {
    const bytes = new Uint8Array(10);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = i % 256;
    }

    const generator = new PasswordGenerator(bytes);
    const password = generator.generatePassword();

    expect(password.length).toBe(22);
  });
});
