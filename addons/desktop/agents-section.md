
## Desktop app (Capacitor + Electron)
- The web app is the product; `electron/` is a thin desktop shell around it. Plain CommonJS JavaScript, no build step: `src/index.js` (main process: window, app:// file serving, CSP), `src/preload.js` (sandboxed bridge), `src/plugins.js` (Capacitor plugin IPC).
- Desktop-only behavior is feature-detected in the page with `Capacitor.getPlatform() === 'electron'` from `@capacitor/core`. The web build must keep working on its own.
- `npm run desktop:dev` opens the shell on the running Vite dev server (hot reload). `npm run desktop` runs it on a fresh build. `npm run desktop:dist` packages installers into `electron/release/`.
- Release builds come from the manually triggered GitHub Action `.github/workflows/build-apps.yml`: web `dist/` plus Windows x64 and arm64 installers and portable exes, as run artifacts.
- The shell's only packages are `electron` and `electron-builder`. Electron APIs and Node built-ins cover everything else.
- Check the layouts inside the desktop window too: it resizes down to 320×320, so every display in the table above applies.
