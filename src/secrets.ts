import { USER_SECRET_KEY } from "./consts";
import { setupStorageApi } from "./storage";

/**
 * Generates a new user-unique secret.
 *
 * This is a random 32-byte value, encoded as a hex string (64 characters).
 * The length and randomness of this secret ensure that the derived passwords are unique
 * to the user and resistant to brute-force attacks, even if the user chooses a weak simple password.
 * The hex encoding is used for easy storage and retrieval as a string in chrome.storage.sync.
 * This function is called only once per user, when the secret is first generated and stored.
 */
export function generateUserSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Returns the user-unique secret, generating and storing it on first call.
 *
 * This secret is what differentiates two users who type the same simple
 * password on the same domain — without it, they would derive identical
 * complex passwords.
 *
 * Stored in chrome.storage.sync so it is automatically available across
 * all of the user's devices. The user should be encouraged to back it up,
 * as losing it (e.g. after uninstalling the extension with sync unavailable)
 * makes all previously generated passwords unrecoverable.
 */
export async function getUserSecret(): Promise<string> {
  const storage = setupStorageApi();
  const result = await storage.get(USER_SECRET_KEY);
  if (result[USER_SECRET_KEY]) {
    return result[USER_SECRET_KEY] as string;
  }

  const secret = generateUserSecret();
  await storage.set({ [USER_SECRET_KEY]: secret });
  return secret;
}
