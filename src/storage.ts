// Both Firefox (`browser`) and Chrome (`chrome`) expose the same
// Promise-based storage API in Manifest V3. We resolve whichever is
// available at runtime so the same code runs in both browsers.
declare const browser: Browser | undefined;
declare const chrome: Browser | undefined;

type Browser = {
  storage: {
    sync: Storage;
  };
  runtime: {
    getManifest(): { name: string };
  };
};

export type Storage = {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
};

const debugApi: Storage = {
  get(key: string): Promise<Record<string, unknown>> {
    const raw = localStorage.getItem(key);
    const value = raw !== null ? JSON.parse(raw) : undefined;
    return Promise.resolve({ [key]: value });
  },
  set(items: Record<string, unknown>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
    return Promise.resolve();
  },
};

let isDebug = false;
let storageApi: Storage | null = null;

function getBrowserInsance(): Browser {
  if (typeof browser !== "undefined") return browser;
  if (typeof chrome !== "undefined") return chrome;
  throw new Error("No browser API found");
}

function checkDebugMode() {
  const browserInstance = getBrowserInsance();

  const manifest = browserInstance.runtime.getManifest();
  isDebug = manifest.name.includes(" (debug)");
  console.log(`[password-ext] Debug mode: ${isDebug}`);
}

export function setupStorageApi(): Storage {
  if (storageApi) return storageApi;
  checkDebugMode();
  if (isDebug) {
    console.warn("[password-ext] Debug mode enabled, using localStorage fallback for storage API.");
    return (storageApi = debugApi);
  }
  const browserInstance = getBrowserInsance();
  return (storageApi = browserInstance.storage.sync);
}
