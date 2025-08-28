# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
