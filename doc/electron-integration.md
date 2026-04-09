# Electron Desktop Integration

> Technical documentation for the Electron desktop build of Creature Nexus TCG.
> Added in v0.24.0 (February 4, 2026). Status: **experimental / WIP** — Electron shell, packaging, and post-export patch flow are in place.

---

## Overview

The Electron integration wraps the Expo web export into a native desktop application for Windows distribution. It uses a two-mode approach: a live dev server for development and static file loading for production.

### Current Status

| Area | Status |
|------|--------|
| Electron configuration (`main.js`, `preload.js`, builder) | Done |
| NPM scripts (`electron:dev`, `electron:build`) | Done |
| Static export post-processing (`scripts/fix-web-build.js`) | Done |
| Dependencies installed | Done |
| Build process completes and produces Windows artifacts | Done |
| Window opens with correct background (`#121626`) | Done |
| App runtime status | Experimental — requires validation on a real packaged build |

---

## Architecture

### Files

```
electron/
├── main.js              # Main Electron process
├── preload.js           # Context bridge (exposes window.creatureNexus.platform)
└── electron-builder.yml # Build configuration (Windows NSIS)
```

### How It Works

```
[Expo Web Build]  →  dist/index.html  →  [Electron BrowserWindow]
      or
[Expo Dev Server]  →  http://localhost:19006  →  [Electron BrowserWindow]
```

- **Development**: Electron loads from the live Expo web dev server (port 19006)
- **Production**: Electron loads the static export from `dist/index.html` via `file://`, after Expo output is patched for relative assets and route-aware navigation

---

## Commands

```bash
# Development — starts Expo web server + Electron window
npm run electron:dev

# Production build — exports web + packages Windows installer
npm run electron:build
```

### Development Flow (`electron:dev`)

1. Sets `ELECTRON_START_URL=http://localhost:19006`
2. Starts Expo web server (`expo start --web`)
3. Waits for port 19006 to be available (`wait-on`)
4. Launches Electron pointing to the dev server
5. DevTools open automatically

### Build Flow (`electron:build`)

1. Cleans `dist/` and `release/` directories (`rimraf`)
2. Runs `expo export --platform web` → static files in `dist/`
3. Runs `node scripts/fix-web-build.js` to rewrite asset paths and patch Expo's web output for static file loading
4. Runs `electron-builder` with `electron/electron-builder.yml`
5. Outputs installer and unpacked app to `release/`

---

## Main Process (`electron/main.js`)

```javascript
const isDev = Boolean(process.env.ELECTRON_START_URL);

const getIndexUrl = () => {
  if (isDev) return process.env.ELECTRON_START_URL;
  return new URL('../dist/index.html', `file://${__dirname}/`).toString();
};
```

### Window Configuration

| Setting | Value |
|---------|-------|
| Width | 1280px |
| Height | 720px |
| Background color | `#121626` |
| Menu bar | Hidden (`autoHideMenuBar: true`) |
| Icon | `assets/images/icon.png` |
| Context isolation | Enabled |
| Node integration | Disabled |
| Sandbox | Disabled |
| DevTools (dev mode) | Auto-open, detached |

### App Identity

- **App ID**: `com.jondari.creaturenexustcg`
- **Product Name**: Creature Nexus TCG

---

## Preload Script (`electron/preload.js`)

Exposes a minimal API to the renderer process via context bridge:

```javascript
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('creatureNexus', {
  platform: 'desktop'
});
```

### Platform Detection in App Code

```typescript
const isElectron = typeof window !== 'undefined' &&
  (window as any).creatureNexus?.platform === 'desktop';
```

Currently not actively used by the app, but available for future platform-specific behavior.

---

## Static Export Patch

The Electron production build depends on the same post-processing step used for static hosting targets such as itch.io:

| File | Role |
|------|------|
| `scripts/fix-web-build.js` | Rewrites exported HTML and bundle loader logic so asset URLs and route resolution work from static files |

### Why This Step Exists

- Expo web export assumes server-style absolute paths in several places
- Electron production loads the app through `file://`
- Absolute asset paths and default route resolution can break when the app is opened directly from local files

The patch script adds relative base handling, route restoration helpers, and bundle-loader fixes before packaging.

---

## Build Configuration (`electron/electron-builder.yml`)

```yaml
appId: com.jondari.creaturenexustcg
productName: Creature Nexus TCG
files:
  - dist/**/*
  - electron/**/*
  - package.json
  - "!node_modules/**/*"
directories:
  output: release
  buildResources: assets/images
extraMetadata:
  main: electron/main.js
asar: true
win:
  target:
    - nsis
  icon: assets/images/icon.png
publish: []
```

| Setting | Value |
|---------|-------|
| Packaging format | ASAR |
| Windows target | NSIS installer |
| Output directory | `release/` |
| Auto-update | Disabled (`publish: []`) |
| Icon | `assets/images/icon.png` (1024x1024 PNG) |

### Build Output

```
release/
├── Creature Nexus TCG Setup X.X.X.exe   # Windows installer (~308 MB)
├── Creature Nexus TCG Setup X.X.X.exe.blockmap
├── win-unpacked/                          # Unpacked app directory
└── latest.yml                             # Update metadata
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `electron` | ^33.2.0 | Desktop runtime |
| `electron-builder` | ^25.1.8 | Packaging and installer creation |
| `concurrently` | ^9.1.0 | Run Expo + Electron in parallel |
| `cross-env` | ^7.0.3 | Cross-platform env variable setting |
| `wait-on` | ^8.0.2 | Wait for dev server before launching Electron |
| `rimraf` | ^6.0.1 | Clean build directories |

All are `devDependencies` — not included in the packaged application runtime.

---

## Security

- **Context isolation**: Enabled — renderer has no direct access to Node.js APIs
- **Node integration**: Disabled — prevents `require()` in renderer
- **Preload script**: Only exposes `creatureNexus.platform` (minimal surface)
- **No IPC**: No inter-process communication implemented yet

---

## Validation Notes

This integration should still be treated as experimental.

Recommended validation after changes affecting routing, assets, or startup:

1. Run `npm run electron:dev` and verify the app boots inside Electron
2. Run `npm run electron:build`
3. Launch the packaged app from `release/win-unpacked/`
4. Verify initial load, route changes, and static assets
5. If startup regresses, inspect Electron DevTools and re-check `scripts/fix-web-build.js`

---

## Current Limitations

- **Windows only**: No macOS or Linux build configured
- **No code signing**: Installer is unsigned
- **No auto-update**: No update framework configured
- **No Steam integration**: Standalone installer only
- **No CI/CD**: Manual build process
- **No native modules**: No Electron-specific native features used
- **No crash reporting**: No Sentry or equivalent configured

---

## Notes

- First build on Windows may require admin privileges (symbolic links)
- `release/` and `dist/` directories are gitignored
- `node_modules` is excluded from the packaged app to reduce size

---

*Last updated: April 2026*
