export type Storage = {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
};

let isDebug = false;
let storageApi: Storage | null = null;

export function getBrowserInstance() {
  if (typeof globalThis.browser !== "undefined") return globalThis.browser;
  if (typeof globalThis.chrome !== "undefined") return globalThis.chrome;
  throw new Error("No browser API found");
}

function checkDebugMode() {
  const browserInstance = getBrowserInstance();

  const manifest = browserInstance.runtime.getManifest();
  isDebug = manifest.name.includes(" (debug)");
  console.log(`[password-ext] Debug mode: ${isDebug}`);
}

export function setupStorageApi(): Storage {
  if (storageApi) return storageApi;
  const browserInstance = getBrowserInstance();
  checkDebugMode();
  if (isDebug) {
    console.warn(
      "[password-ext] Debug mode enabled, using storage local fallback for storage API.",
    );
    return (storageApi = browserInstance.storage.local);
  }
  return (storageApi = browserInstance.storage.sync);
}
