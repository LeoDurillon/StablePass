# Stable Pass

A Chrome/Firefox browser extension that **deterministically derives strong passwords** from a simple, memorable one — no password stored, no sync account needed beyond your browser.

---

## How it works

Stable Pass activates as a content script on every page. When you focus on a `input[type="password"]` field:

1. A tooltip appears: *"Press Tab to generate a password"*
2. Type your simple, memorable password
3. Press **Tab** — the input is replaced with a strong 22-character derived password
4. Use the **refresh button** beside the field to rotate the password for that domain, generating a new strong password from the same simple one without affecting any other site

The same inputs always produce the same output — your passwords are fully reproducible as long as you remember your simple password and haven't rotated.

A **popup** (accessible via the extension icon) shows the current domain and lets you inspect and manually adjust the version counter for that domain.

---

## Cryptography

Passwords are derived using the **Web Crypto API** in a two-step pipeline.

### KDF inputs

| Input | Description |
|---|---|
| Simple password | What you type |
| Origin | `window.location.origin` of the current page |
| User secret | A random 64-char hex string, generated once on first use and stored in `chrome.storage.sync` |
| Version | A per-domain counter (starts at 1, incremented on refresh), stored in `chrome.storage.sync` |

### Pipeline

1. **PBKDF2** — 600,000 iterations, SHA-256 → 32 bytes  
   Slow by design: makes brute-force infeasible even if an attacker obtains a derived password.

2. **HKDF-Expand** — SHA-256, info: `"password-generation"` → 64 bytes  
   Stretches the PBKDF2 output to give the password generator enough entropy for rejection sampling.

### Output

- **22 characters** long
- Guaranteed to contain at least one: lowercase letter, uppercase letter, digit, special character
- Characters are selected via **rejection sampling** — no modulo bias, perfectly uniform distribution
- The character array is **Fisher-Yates shuffled** using the byte stream
- Results are **cached in memory** per `(domain, value, version)` triple — the KDF never runs twice for the same inputs within a session

---

## Security properties

- **Same password, different domain** → different complex password (origin is part of the salt)
- **Same password, different user** → different complex password (user secret is part of the salt)
- **Password rotation** → incrementing a domain's version produces a completely new password without affecting any other domain
- **Cross-device sync** → the user secret and version counters sync via `chrome.storage.sync`
- **No server, no account** → nothing leaves the browser

> ⚠️ Back up your user secret. Losing it (e.g. after uninstalling the extension when sync is unavailable) makes all previously generated passwords unrecoverable.

---

## Monorepo structure

This repository is a Bun workspace with two apps and one shared package.

```
stable-pass/
├── apps/
│   ├── generator/             # Content script — injected into every page
│   └── popup/                 # Extension popup — React UI for version management
├── packages/
│   └── shared/                # Shared library — storage, secrets, versions, tabs
├── manifest/
│   ├── manifest.json          # Manifest V2 config
│   └── icon.png
├── out/                       # Final build output (gitignored)
├── build.sh                   # Root build script
└── package.json               # Workspace root
```

See each package's own README for details on its internals.

---

## Storage

The extension stores two keys in `chrome.storage.sync` (or `browser.storage.sync` on Firefox):

| Key | Value |
|---|---|
| `user_secret` | 64-char hex string, unique per user |
| `versions` | `{ [origin]: number }` — per-domain rotation counters |

**Debug mode**: if the manifest `name` field contains `" (debug)"`, the extension uses `chrome.storage.local` instead of `chrome.storage.sync`. This avoids needing a real browser sync account during development while still using the proper extension storage API (unlike `localStorage`, it is accessible from both the content script and the popup).

---

## Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0

### Setup

```sh
bun install
```

This installs dependencies for all workspace packages at once.

### Build

```sh
bun run build
```

Runs `build.sh`, which:
1. Cleans `out/`
2. Runs `bun --filter '*' build` to build all packages
3. Copies `apps/generator/out/*` → `out/`
4. Copies `apps/popup/dist/*` → `out/popup/`
5. Copies `manifest/*` → `out/`

### Tests

```sh
bun test --isolate
```

Runs the full test suite across all workspace packages. Each test file runs in an isolated module environment.

### Other commands

| Command | Description |
|---|---|
| `bun run lint` | Lint with oxlint |
| `bun run lint:fix` | Lint and auto-fix |
| `bun run fmt:check` | Check formatting with oxfmt |
| `bun run fmt` | Format the codebase |

### Loading in the browser

**Chrome**
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `out/` folder

**Firefox**
1. Go to `about:debugging`
2. Click **Load Temporary Add-on** → select `out/manifest.json`

---

## Tech stack

| Concern | Tool |
|---|---|
| Runtime / bundler | [Bun](https://bun.sh) |
| Language | TypeScript (strict, ESNext) |
| Popup UI | React 19 + Tailwind CSS 4 |
| Tests | `bun:test` + [Happy DOM](https://github.com/capricorn86/happy-dom) |
| Linter | [oxlint](https://oxc.rs/docs/guide/usage/linter) |
| Formatter | [oxfmt](https://oxc.rs/docs/guide/usage/formatter) |

---

## Author

Leo Durillon
