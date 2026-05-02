import { VERSIONS_KEY } from "./consts";
import { setupStorageApi } from "./storage";

/**
 * Returns the current version counter for a given domain.
 * Defaults to 0 and only ever changes when the user explicitly rotates
 * their password for that site.
 */
export async function getVersion(domain: string): Promise<number | null> {
  const result = await setupStorageApi().get(VERSIONS_KEY);
  const versions = (result[VERSIONS_KEY] as Record<string, number>) ?? {};
  return versions[domain] ?? null;
}

/**
 * Increments the version counter for a domain and returns the new value.
 *
 * Call this when the user needs to rotate their password for a site
 * (e.g. after a breach or a forced reset). The incremented version causes
 * the KDF to produce a completely different complex password from the same
 * simple password, without affecting any other site.
 */
export async function incrementVersion(domain: string): Promise<number> {
  const storage = setupStorageApi();
  const result = await storage.get(VERSIONS_KEY);
  const versions = (result[VERSIONS_KEY] as Record<string, number>) ?? {};
  const newVersion = (versions[domain] ?? 0) + 1;
  versions[domain] = newVersion;
  await storage.set({ [VERSIONS_KEY]: versions });
  return newVersion;
}
