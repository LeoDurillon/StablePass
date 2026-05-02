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

---

## Security properties

- **Same password, different domain** → different complex password (origin is part of the salt)
- **Same password, different user** → different complex password (user secret is part of the salt)
- **Password rotation** → incrementing a domain's version produces a completely new password without affecting any other domain
- **Cross-device sync** → the user secret syncs via `chrome.storage.sync`
- **No server, no account** → nothing leaves the browser

> ⚠️ Back up your user secret. Losing it (e.g. after uninstalling the extension when sync is unavailable) makes all previously generated passwords unrecoverable.

---

## Project structure

```
password_extension/
├── index.ts                   # Entry point — attaches listeners to all password inputs
├── src/
│   ├── consts.ts              # Shared constants (iterations, character sets, key names…)
│   ├── secrets.ts             # User secret: generate on first use, retrieve from sync storage
│   ├── storage.ts             # Browser storage abstraction (Chrome / Firefox / debug fallback)
│   ├── versions.ts            # Per-domain version counter (get / increment)
│   ├── dom/
│   │   ├── element.ts         # Typed createElement helper
│   │   └── listeners.ts       # Input event handlers, helper tooltip, refresh button
│   └── generator/
│       ├── derive.ts          # Orchestrates the full derivation flow
│       ├── kdf.ts             # PBKDF2 + HKDF-Expand
│       └── generator.ts       # Converts byte stream → password string
├── manifest/
│   ├── manifest.json          # Manifest V2 config
│   └── icon.png
├── __tests__/                 # Bun test suite (mirrors src/)
├── build.sh                   # Build script
├── bunfig.toml                # Bun config (Happy DOM preload for tests)
└── package.json
```

---

## Storage

The extension stores two keys in `chrome.storage.sync` (or `browser.storage.sync` on Firefox):

| Key | Value |
|---|---|
| `user_secret` | 64-char hex string, unique per user |
| `versions` | `{ [origin]: number }` — per-domain rotation counters |

**Debug mode**: if the manifest `name` field contains `" (debug)"`, the extension falls back to `localStorage` instead of browser sync storage. Useful for local development without loading the extension into the browser.

---

## Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0

### Setup

```sh
bun install
```

### Commands

| Command | Description |
|---|---|
| `bun run build` | Bundle `index.ts` with Bun → `out/`, copy `manifest/*` → `out/` |
| `bun run test` | Run the test suite isolated by default |
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

- **Runtime / bundler**: [Bun](https://bun.sh)
- **Language**: TypeScript (strict, ESNext)
- **Tests**: `bun:test` + [Happy DOM](https://github.com/capricorn86/happy-dom)
- **Linter**: [oxlint](https://oxc.rs/docs/guide/usage/linter)
- **Formatter**: [oxfmt](https://oxc.rs/docs/guide/usage/formatter)

---

## Author

Leo Durillon
