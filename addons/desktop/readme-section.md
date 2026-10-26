
# Desktop app

The web app also ships as a desktop app through Capacitor and Electron. The shell lives in `electron/`.

One-time setup (installs the shell's packages and downloads the Electron binary, whose install script npm blocks):
```
npm run desktop:setup
```

| Command | What it does |
|---|---|
| `npm run desktop:dev` | Opens the desktop window on the running `npm run dev` server, with hot reload |
| `npm run desktop` | Builds the web app and opens it in the desktop window |
| `npm run desktop:dist` | Builds installers for this OS into `electron/release/` |

## Build artifacts on GitHub
Actions → **Build apps** → Run workflow. It builds the web app (`dist/`) and Windows x64 and arm64 installers plus
portable exes, then attaches them to the run as artifacts. Commit both `package-lock.json` and
`electron/package-lock.json` so the build installs exactly what you tested.
