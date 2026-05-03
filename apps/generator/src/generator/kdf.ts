import { PBKDF2_ITERATIONS } from "@stable-pass/shared";

/**
 * Generates the salt bytes for PBKDF2 by combining the domain, user secret, and version.
 *
 * @param domain The domain for which to generate the password.
 * @param userSecret A user-specific secret that adds an extra layer of security.
 * @param version A version number that allows users to rotate their passwords for a site without changing their simple password.
 * @returns A Uint8Array containing the salt bytes.
 */
function generateSaltBytes(domain: string, userSecret: string, version: number) {
  const encoder = new TextEncoder();
  return encoder.encode(`${domain}:${userSecret}:${version}`);
}

/**
 * Generates the Initial Key Material (IKM) using PBKDF2 with the given password and salt.
 *
 * @param passwordBytes The user's simple password input, encoded as a Uint8Array.
 * @param saltBytes The salt bytes generated from the domain, user secret, and version.
 * @returns A promise that resolves to an ArrayBuffer containing the derived IKM, which will be used as input for HKDF expansion.
 */
async function generateIKM(
  passwordBytes: Uint8Array<ArrayBuffer>,
  saltBytes: Uint8Array<ArrayBuffer>,
): Promise<ArrayBuffer> {
  const pbkdf2BaseKey = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, [
    "deriveBits",
  ]);

  const ikm = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    pbkdf2BaseKey,
    256, // 32 bytes
  );

  return ikm;
}

/**
 * Expands the Initial Key Material (IKM) using HKDF-Expand to produce a longer output.
 *
 * @param ikm The Initial Key Material derived from PBKDF2, which serves as the input keying material for HKDF.
 * @returns A promise that resolves to an ArrayBuffer containing the expanded key material, which can then be used for password generation.
 */
async function generateHDKFExpand(ikm: ArrayBuffer): Promise<ArrayBuffer> {
  const hkdfBaseKey = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);

  return await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0),
      // "info" domain-separates this expansion from any other potential use
      // of the same IKM (e.g. if the key material were ever reused elsewhere).
      info: new TextEncoder().encode("password-generation"),
    },
    hkdfBaseKey,
    512, // 64 bytes — plenty for rejection sampling across 22 characters
  );
}

/**
 * Derives 64 bytes of key material from the given inputs.
 *
 * Two-step process:
 *  1. PBKDF2 (600k iterations, SHA-256) — slow by design, makes brute-force infeasible
 *     even if an attacker obtains one of the generated complex passwords.
 *  2. HKDF-Expand — fast, stretches the 32-byte PBKDF2 output to 64 bytes so the
 *     password generator has enough entropy to apply rejection sampling without issues.
 *
 * @param simplePassword The user's simple password input. Should be memorable but not complex, since security comes from the KDF, not the password itself.
 * @param domain The domain for which to generate the password. This is part of the salt to ensure different outputs for different sites.
 * @param userSecret A user-specific secret (e.g. a random string generated at setup and stored securely) that adds an extra layer of security. Also part of the salt.
 * @param version A version number that allows users to rotate their passwords for a site without changing their simple password. Also part of the salt.
 * @returns A promise that resolves to a Uint8Array containing the derived key material, which can then be used to generate the complex password.
 */
export async function derivePasswordBytes(
  simplePassword: string,
  domain: string,
  userSecret: string,
  version: number,
): Promise<Uint8Array> {
  const passwordBytes = new TextEncoder().encode(simplePassword);
  // Salt combines all contextual inputs
  const saltBytes = generateSaltBytes(domain, userSecret, version);

  // ── Step 1: PBKDF2 ──────────────────────────────────────────────────────────
  const ikm = await generateIKM(passwordBytes, saltBytes);

  // ── Step 2: HKDF-Expand ─────────────────────────────────────────────────────
  const expanded = await generateHDKFExpand(ikm);

  return new Uint8Array(expanded);
}
