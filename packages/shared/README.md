# @stable-pass/shared

The **shared library** for the Stable Pass extension. Consumed by both the content script (`@stable-pass/generator`) and the popup (`@stable-pass/popup`). Provides all browser API access, storage management, secret handling, version counters, and tab utilities.

---

## Public API

```ts
// Secrets
getUserSecret(): Promise<string>

// Versions
getVersion(domain: string): Promise<number | null>
setVersion(domain: string, version: number): Promise<void>
incrementVersion(domain: string): Promise<number>

// Tabs
getActiveTabUrl(): Promise<URL>

// Storage type
type Storage = {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

// Constants (re-exported from consts.ts)
PBKDF2_ITERATIONS, USER_SECRET_KEY, VERSIONS_KEY, DEBOUNCE_MS,
LOWERCASE, UPPERCASE, NUMBERS, SPECIAL, ALL, PASSWORD_LENGTH
```

---

## Structure

```
packages/shared/
├── index.ts                   # Public exports
├── src/
│   ├── consts.ts              # KDF parameters, character sets, storage key names
│   ├── secrets.ts             # User secret — generate, retrieve (promise-cached), clear
│   ├── storage.ts             # Browser storage abstraction (Chrome / Firefox / debug)
│   ├── tabs.ts                # Active tab URL via browser.tabs.query
│   └── versions.ts            # Per-domain version counters (get, set, increment)
└── __tests__/
    ├── secrets.spec.ts
    ├── tabs.spec.ts
    └── versions.spec.ts
```

---

## Modules

### `storage.ts`

Detects the available browser runtime (`globalThis.browser` on Firefox, `globalThis.chrome` on Chrome) and returns the appropriate storage object. The result is cached as a singleton — `setupStorageApi()` only runs the detection once.

**Debug mode**: if the manifest name includes `" (debug)"`, `chrome.storage.local` is used instead of `chrome.storage.sync`. Both contexts (content script and popup) share the same `local` storage, making it safe for development.

### `secrets.ts`

Manages the user-unique 64-char hex secret that is generated once and stored in sync storage.

- `getUserSecret()` is **TOCTOU-safe**: the entire fetch-or-generate flow is wrapped in a Promise singleton (`secretPromise`). Concurrent callers all await the same in-flight operation — only one storage read and at most one storage write ever happen.
- `generateUserSecret()` is exported for testing purposes only — it should not be called directly in application code.

### `versions.ts`

Stores a single object `{ [origin: string]: number }` under the `versions` key. Provides:

- `getVersion(domain)` — returns the current counter or `null` if not yet set
- `setVersion(domain, version)` — overwrites the counter for a domain
- `incrementVersion(domain)` — increments and returns the new counter (starts at 1)

All three functions read the full `versions` object, mutate it in memory, and write it back — they are not atomic but are safe under the single-threaded JavaScript model.

### `tabs.ts`

Calls `browser.tabs.query({ active: true, currentWindow: true })` and parses the result as a `URL`. Throws descriptive errors if no browser API is found, no active tab exists, or the tab has no URL. Requires the `activeTab` permission in the manifest.

### `consts.ts`

Centralises all magic numbers and strings:

| Constant | Value | Used for |
|---|---|---|
| `PBKDF2_ITERATIONS` | `600_000` | KDF hardness |
| `PASSWORD_LENGTH` | `22` | Output length |
| `USER_SECRET_KEY` | `"user_secret"` | Storage key |
| `VERSIONS_KEY` | `"versions"` | Storage key |
| `LOWERCASE` / `UPPERCASE` / `NUMBERS` / `SPECIAL` / `ALL` | character sets | Password generation |

---

## Tests

```sh
bun test --isolate
```

Each test file runs in an isolated module context. The `storage` module is mocked via `mock.module` so tests never touch real browser APIs. `jest.resetAllMocks()` in `beforeEach` ensures mock implementations are fully cleared between tests.

---

## Design notes

- **No default export** — all exports are named for explicit, greppable imports
- **Internal APIs are not re-exported** — `setupStorageApi`, `getBrowserInstance`, and `generateUserSecret` are kept out of `index.ts` to keep the public surface minimal
- **`clearUserSecret`** is intentionally not exported from `index.ts` — it exists only to support test teardown and should not be called in production code
