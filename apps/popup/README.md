# @stable-pass/popup

The **extension popup** for Stable Pass. A React application that opens when the user clicks the extension icon, showing the current domain's origin and providing a UI to inspect and adjust the per-domain version counter.

---

## Responsibilities

- Query the active tab's URL via `browser.tabs.query` and display its origin
- Show the current version counter for that domain
- Allow the user to increment or decrement the version, with writes debounced by 500 ms
- Serve as a local dev server during development (Bun + HMR)

---

## Structure

```
apps/popup/
├── src/
│   ├── app/
│   │   ├── App.tsx            # Root component — fetches active tab URL, renders VersionCounter
│   │   └── VersionCounter.tsx # Version display + +/- controls with debounced storage writes
│   ├── assets/
│   │   └── Logo.png
│   ├── styles/
│   │   └── index.css          # Tailwind CSS entry point
│   ├── index.html             # HTML shell
│   ├── index.ts               # Bun dev server entry point
│   └── main.tsx               # React root (createRoot + HMR support)
├── build.ts                   # Production build script (Bun bundler + Tailwind plugin)
├── bun-env.d.ts               # Module declarations for image and CSS imports
├── bunfig.toml                # Bun config
└── package.json
```

---

## Components

### `App`

Runs once on mount, queries the active tab with `getActiveTabUrl()` from `@stable-pass/shared`, and stores the `origin` in state. Renders `VersionCounter` only when the domain is known, so the UI never shows stale or empty data.

### `VersionCounter`

Displays the stored version for the current domain and provides `+` / `-` buttons.

- On mount (or when `domain` changes): resets `currentVersion` to `0`, then fetches the real value from storage and updates state
- On every state change: debounces a write to storage by 500 ms; skips the write if `currentVersion` is still `0` (the reset sentinel used while loading)

---

## Development

Start the dev server with hot module replacement:

```sh
bun --hot src/index.ts
```

The popup is served at the logged URL. Because it runs outside the extension context, browser extension APIs (`chrome`, `browser`) are not available — storage calls will throw unless you mock them or test with the actual extension loaded.

---

## Build

```sh
bun run build
```

Runs `build.ts`, which uses the Bun bundler with the Tailwind CSS plugin. Output goes to `dist/`. The root `build.sh` copies `dist/*` into `out/popup/` as part of the full extension build.

Sourcemaps are generated alongside the output for debugging.

---

## Dependencies

| Package | Role |
|---|---|
| `@stable-pass/shared` | `getActiveTabUrl`, `getVersion`, `setVersion` |
| `react` / `react-dom` | UI rendering |
| `tailwindcss` | Styling |
| `bun-plugin-tailwind` | Tailwind integration for the Bun bundler |
