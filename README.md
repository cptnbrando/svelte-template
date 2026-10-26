# A Svelte Project Template.

Uses
- Vite
- Svelte
- TailwindCSS
- JavaScript (fuck TypeScript lol)
- Icons (@lucide/svelte)
- Testing
  - Vitest
  - JSDOM
  - @testing-library/svelte
  - @testing-library/jest-dom

# Browser Support

No legacy plugin, no polyfills. Two tiers:
- **The app**: Chrome/Edge 99+, Firefox 97+, Safari 15.4+. Vite lowers JS (Oxc) and CSS (Lightning CSS) to these targets, set in `vite.config.js`. The floor is CSS cascade layers, which Tailwind v4 needs.
- **Static fallback**: everything older, down to Chrome 40, plus visitors with JS off. A plain HTML page in `index.html` (styles in `src/styles/legacy-fallback.css`). It also shows if the app crashes before rendering.

# Creating an app

Copy the template and run the setup once:
```
git clone --depth 1 <svelte-template repo URL> my-app
cd my-app
node start.js
npm i
```

`start.js` asks for:
- the package name, title and one-line description (fills `package.json`, `index.html`, the manifest and `README.md`)
- whether to add the **desktop app**: a Capacitor + Electron shell in `electron/` and a manually triggered GitHub Action that builds the web app and Windows installers as artifacts
- the **git workflow** agents follow (commit locally, push with draft PRs, or leave changes uncommitted)
- optional **app details for AGENTS.md**, one statement per line, plus a data source URL

Then it deletes itself and `addons/`, so the new app carries no setup code. `start.ps1` and `start.sh` are shortcuts for `node start.js`.

# Working on the template

- Theme tokens and custom variants: `src/styles/theme.css`
- Agent rules: `AGENTS.md` (the `<!-- setup:* -->` blocks are what `start.js` rewrites)
- Desktop add-on: `addons/desktop/` (`files/` is copied into the app as-is)
