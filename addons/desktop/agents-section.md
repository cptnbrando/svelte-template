## Native apps (Tauri 2)
- Selected native targets: __PLATFORMS__.
- `src/tauri/` is the Rust shell; the Svelte/Vite web app remains the product and must continue to build independently.
- Detect native-only behavior with `isTauri()` from `@tauri-apps/api/core`. Keep web behavior available when running in a browser.
- `npm run tauri:dev` opens the Tauri development shell. `npm run tauri:build` builds the current host target. `npm run tauri:build:platforms` builds the selected native targets where the host toolchain supports them.
- Release builds are manually triggered from `.github/workflows/build-apps.yml`. Each selected platform is built on its required GitHub-hosted runner and uploaded as an artifact.
- Android builds require Android Studio command line tools and an installed SDK/NDK; iOS builds require macOS and Xcode. Linux and Windows builds use their native runner toolchains.
- Check native window layouts down to 320×320; every responsive layout requirement applies.
