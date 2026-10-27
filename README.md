# DOGS Svelte Template

Starter for DOGS apps built with Vite, Svelte 5, Tailwind CSS v4, JavaScript with JSDoc, and Cloudflare Workers, D1, R2, and Pages. Database access uses native Cloudflare bindings and D1 APIs; no ORM is used. Native apps use Tauri 2 and share the same Cloudflare APIs.

## Branches

`master` is the only root branch, for this template and every app created from it. There is no `main` branch. Keep `master` as the GitHub default branch and the Cloudflare Pages production branch; all other work happens on feature branches merged into `master`.

## The three environments

All apps use separate local, staging, and production environments.

### Local (your laptop)

Run Pages Functions on Workers with `npm run cloudflare:dev` (`npx wrangler pages dev ../dist` from `api/`). Wrangler uses Miniflare to simulate Workers and D1 locally. Standalone Workers run with `npx wrangler dev`. Local D1 data is stored in a SQLite file under `api/.wrangler/state/`, stays on your machine, and is ignored by Git. Use SQL migrations and test data here.

### Staging / Preview (pull requests and testing)

Staging runs on Cloudflare's global edge network through a Cloudflare Pages preview deployment. GitHub Actions deploys branch and pull request changes to preview, where all previews share a dedicated staging D1 database containing synthetic test data. Keep preview migrations additive and do not reset this shared database.

### Production (live users)

Production runs on Cloudflare's global edge network through Cloudflare Pages and Workers. It uses a separate production D1 database. GitHub Actions deploys production only when changes reach `master`.

Cloudflare Pages and GitHub Actions must have separate preview and production D1 bindings configured. Configure the Actions Cloudflare API token and account ID as repository secrets; never put credentials in source files. Preview contains synthetic test data only. Fork pull requests cannot access deployment secrets and are not deployed.

### Before the first deploy

Create a Pages Direct Upload project with `npx --yes wrangler pages project create` and use the `name` from `api/wrangler.jsonc`; select `master` as its production branch. Direct Upload keeps GitHub Actions as the deployment path. Create separate staging and production D1 databases, then replace the matching database ID placeholders in `api/wrangler.jsonc`. Add `CLOUDFLARE_API_TOKEN` (Pages and D1 edit access) and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets. The generated `deploy-cloudflare.yml` applies the environment's SQL migrations and deploys previews for branch pushes and pull requests; pushes to `master` deploy production.

For a local Pages Functions and D1 session, run `npm install`, `npm run build`, then `npm run cloudflare:dev`. Run local SQL migrations with `npm run cloudflare:db:migrate:local`. The local database is isolated from Cloudflare and is not a copy of staging or production.

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

Setup asks for the package name, title, description, target platforms, git workflow, and optional app details. Target platforms come from a checkbox list (arrow keys move, space toggles, `a` or the "all" row checks everything, Enter confirms), so any combination of Web, Android, iOS, macOS, Windows, and Linux works. Piped answers (`node start.js < answers.txt`) give platforms as comma-separated numbers instead. Every generated app receives Cloudflare Pages, Functions, D1, and branch deployment workflows. Native selections also add a Tauri 2 shell and a manually triggered GitHub Actions workflow that builds selected targets on compatible runners.

If the folder's current branch is `main` (for example after `git init`), setup renames it to `master`. Then `start.js` removes itself and `addons/` so the generated app carries no setup code. `start.ps1` and `start.sh` are shortcuts for `node start.js`.

## Working on the template

- Theme tokens and custom variants: `src/styles/theme.css`
- Agent rules: `AGENTS.md` (`<!-- setup:* -->` blocks are rewritten by `start.js`)
- Tauri add-on: `addons/desktop/` (`files/` is copied into selected apps; the shell lands in `src/tauri/`)
- Cloudflare Pages, Functions, D1, and deployment workflow: `addons/cloudflare/files/` (generated apps get `api/functions/`, `api/migrations/` and `api/wrangler.jsonc`)
