# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.2] - 2025-08-29

### Changed
- Unified logging to per-user path: `app.getPath("userData")/logs/app.log` using `electron-log` with rotation (1MB).
- Electron now initializes `electron-log` and uses `resolvePathFn` to set the log file.
- Renderer console messages are piped into the unified log via `console-message`.
- Python reads `LOG_DIR` from environment (set by Electron) and falls back to `BASE_DIR/logs`.

### Removed
- Persistent `stdout` logger in `createPythonProcess()` that echoed all Python stdout; keeps per-request parsing intact to avoid logging large JSON payloads.

### Fixed
- Logs persist across auto-updates (no longer written under `resources/app`).
- Reduced log noise from large backend responses.

### Contributors
- @CortoMaltese3

## [2.0.1] - 2025-08-29

### Added

- Auto-update flow via `electron-builder` + `electron-updater` (GitHub provider).
- Update dialogs and progress logging: `update-available`, `update-not-available`, `download-progress`, `update-downloaded`, `error`.
- CI: GitHub Actions workflow to build & publish Windows NSIS releases on tag push (`.github/workflows/app_release.yml`).

### Changed

- Call `autoUpdater.checkForUpdatesAndNotify()` after `app.whenReady()` only in packaged builds.
- UX: prompt user to **Restart** or **Later** after download.

### Removed

- `autoUpdater.setFeedURL(...)` (not needed with GitHub provider).

### Contributors

- @CortoMaltese3

## [2.0.0] - 2025-08-28

### Changed

- **Frontend migration** from Create React App (CRA) to Vite for faster builds, leaner configuration, and modern standards.
- **Electron configuration** updated:
  - Enabled `contextIsolation` and `sandbox` while disabling `nodeIntegration` for improved security.
  - Refactored `electron.js` for clarity and better handling of Python subprocess communication.
- **Vite configuration**:
  - Introduced `vite.config.mjs` with simplified `manualChunks` and modern build target (`es2022`).
  - Disabled CSS code splitting (`cssCodeSplit: false`) to avoid multiple requests under `file://`.
  - Conditional sourcemaps (`mode === "development"`) to prevent source exposure in production.
- **HTML templates** (`index.html`, `loader.html`):
  - Added stricter Content-Security-Policy (CSP) meta tags.
  - Updated meta information and security-related headers to address Electron console warnings.

### Added

- `npm run dev` script for Vite development server with hot module reloading.
- `npm run quickstart` for launching Electron without rebuilding when already built.

### Removed

- Deprecated CRA dependencies and configurations.
- Legacy Emotion deduplication and unnecessary overrides in package.json.

### Fixed

- File extension inconsistencies (`.js` → `.jsx`) to align with Vite import rules.
- Dependency mismatches after migration (restored stable versions for React, Emotion, and Vite ecosystem).
- Security warnings in Electron DevTools by adjusting preload and CSP settings.

### Contributors

- @CortoMaltese3
