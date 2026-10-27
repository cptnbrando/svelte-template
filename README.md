# DOGS Svelte Template

Starter for DOGS apps built with Vite, Svelte 5, Tailwind CSS v4, JavaScript with JSDoc, and Drizzle ORM. Native apps use Tauri 2.

## Browser support

- **The app** runs on Chrome/Edge 99+, Firefox 97+ and Safari 15.4+. Vite lowers JS and CSS to these targets in `vite.config.js`.
- **Static fallback**: older browsers (down to Chrome 40) and visitors with JS off get the plain HTML page in `index.html`, styled by `src/styles/legacy-fallback.css`.

## Creating an app

Copy the template and run setup once:

```sh
git clone --depth 1 <svelte-template repo URL> my-app
cd my-app
node start.js
npm install
```

Setup asks for the package name, title, description, target platforms, git workflow, and optional app details. Choose any combination of Web, Android, iOS, macOS, Windows, and Linux. Native selections add a Tauri 2 shell and a manually triggered GitHub Actions workflow that builds selected targets on compatible runners. Web-only apps do not receive native build files.

Then `start.js` removes itself and `addons/` so the generated app carries no setup code. `start.ps1` and `start.sh` are shortcuts for `node start.js`.

## Working on the template

- Theme tokens and custom variants: `src/styles/theme.css`
- Agent rules: `AGENTS.md` (`<!-- setup:* -->` blocks are rewritten by `start.js`)
- Tauri add-on: `addons/desktop/` (`files/` is copied into selected apps)
