# @stable-pass/generator

The **content script** for the Stable Pass extension. Injected into every page, it attaches event listeners to all `input[type="password"]` fields and handles the full password generation UX.

---

## Responsibilities

- Detect password input fields and attach an `InputListener` to each one
- Show a helper tooltip and a refresh button when the user starts typing
- Derive and inject the strong password when the user presses **Tab**
- Handle password rotation (refresh button) per domain
- Cache derivation results in memory to avoid re-running the expensive KDF

---

## Structure

```
apps/generator/
├── index.ts                   # Entry point — querySelectorAll + InputListener per field
├── src/
│   ├── dom/
│   │   ├── element.ts         # Typed createElement helper with writable-property filtering
│   │   └── listeners.ts       # InputListener class, createHelperBox, createRefreshButton
│   ├── generator/
│   │   ├── derive.ts          # Orchestrates derivation + in-memory cache
│   │   ├── kdf.ts             # PBKDF2 → HKDF-Expand pipeline
│   │   └── generator.ts       # Byte stream → password string (rejection sampling + shuffle)
│   └── icons/
│       └── refresh.ts         # SVG string for the refresh button icon
└── __tests__/
    ├── dom/
    │   ├── element.spec.ts
    │   └── listeners.spec.ts
    └── generator/
        ├── derive.spec.ts
        ├── generator.spec.ts
        └── kdf.spec.ts
```

---

## How `InputListener` works

Each password field gets its own `InputListener` instance with fully isolated state. There is no shared module-level state.

| Event | Behaviour |
|---|---|
| `input` | Updates the tracked value; shows helper tooltip + refresh button once ≥ 4 chars are typed; hides them if the value drops below 4 chars |
| `keydown` (Tab) | Calls `generate(inputValue)` and writes the derived password into the field |
| `focusout` | After 500 ms (to allow button clicks), removes the tooltip and refresh button |
| Refresh button click | Confirms with the user, then calls `generate(inputValue, rotate: true)` |

`generate()` is wrapped in `try/finally` — the loading state is always cleared even if derivation fails.

---

## Derivation cache

`derive.ts` maintains a `Map<string, string>` keyed on `${domain}:${value}:${version}`. The PBKDF2 + HKDF pipeline is intentionally slow (600k iterations); the cache ensures it only runs once per unique input triple within a page session.

---

## Build

```sh
bun run build
```

Bundles `index.ts` with Bun into `out/index.js`. The root `build.sh` copies this output into the final extension `out/` directory.

---

## Tests

```sh
bun test --isolate
```

The test suite uses `bun:test` with [Happy DOM](https://github.com/capricorn86/happy-dom) as the DOM environment (configured in `bunfig.toml`). Each test file runs in an isolated module context. The `@stable-pass/shared` storage layer is mocked via `mock.module`.

---

## Dependencies

| Package | Role |
|---|---|
| `@stable-pass/shared` | Storage, secrets, version counters |
