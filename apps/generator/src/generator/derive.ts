import { getUserSecret, getVersion, incrementVersion } from "@stable-pass/shared";
import { PasswordGenerator } from "./generator";
import { derivePasswordBytes } from "./kdf";

const derivedMap = new Map<string, string>();

/**
 * Derives a complex password from a simple password, the current domain, and a user secret.
 *
 * @param value The simple password provided by the user.
 * @param rotate Whether to rotate the version for the domain, generating a new password.
 * @returns The derived complex password.
 */
export async function derivePassword(value: string, rotate: boolean = false): Promise<string> {
  const domain = window.location.origin;
  let version = rotate ? await incrementVersion(domain) : await getVersion(domain);
  if (version === null) {
    // If the version is null, it means this is the first time the user is generating a password for this domain.
    // We can set the version to 1 in this case.
    version = await incrementVersion(domain);
  }

  const userSecret = await getUserSecret();
  if (derivedMap.has(`${domain}:${value}:${version}`)) {
    return derivedMap.get(`${domain}:${value}:${version}`)!;
  }

  const bytes = await derivePasswordBytes(value, domain, userSecret, version);

  const password = new PasswordGenerator(bytes).generatePassword();
  derivedMap.set(`${domain}:${value}:${version}`, password);
  return password;
}
