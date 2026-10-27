# __APP_TITLE__

__APP_DESCRIPTION__

Built by DOGS with Vite, Svelte 5, Tailwind CSS v4, plain JavaScript, and Cloudflare Workers, D1, R2, and Pages. Database access uses native Cloudflare bindings and APIs. No ORM is used.

## Getting started
```
npm install
npm run dev
```

## Layout

- `src/`: the Svelte web app (the product).
- `api/`: Cloudflare Pages Functions (`api/functions/`), SQL migrations (`api/migrations/`) and `wrangler.jsonc`. Run Wrangler from this folder.
- `src/tauri/`: the Tauri 2 native shell, when native platforms are selected.

## Branches

`master` is the only root branch. There is no `main` branch. Keep `master` as the GitHub default branch and the Cloudflare Pages production branch; all other work happens on feature branches merged into `master`.

## The three environments

Never use production data in local development or staging. Staging contains synthetic test data only. Native apps call Cloudflare APIs and never connect directly to D1.

- **Local (your laptop)**: Run Pages Functions on Workers with `npm run cloudflare:dev` (`npx wrangler pages dev ../dist` from `api/`). Wrangler uses Miniflare to simulate Workers and D1. Standalone Workers run with `npx wrangler dev`. Local D1 uses a SQLite file under `api/.wrangler/state/`; it stays on your machine and is ignored by Git. Use SQL migrations and test data.
- **Staging / Preview (pull requests and testing)**: GitHub Actions deploys branch and pull request changes to Cloudflare Pages preview deployments on Cloudflare's edge. All previews share a dedicated staging D1 database with synthetic test data; keep migrations additive and do not reset shared staging data.
- **Production (live users)**: Cloudflare Pages and Workers serve production traffic on Cloudflare's edge and use a separate production D1 database. GitHub Actions deploys production only from `master`.

Configure separate preview and production D1 bindings in Cloudflare. Set a least-privilege Cloudflare API token and account ID as GitHub repository secrets; do not commit credentials. Fork pull requests cannot access deployment secrets and are not deployed.

### Before the first deploy

Create a Pages Direct Upload project with `npx --yes wrangler pages project create` and use the `name` from `api/wrangler.jsonc`; select `master` as its production branch. Direct Upload keeps GitHub Actions as the deployment path. Create separate staging and production D1 databases, then replace the matching database ID placeholders in `api/wrangler.jsonc`. Add `CLOUDFLARE_API_TOKEN` (Pages and D1 edit access) and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets. The generated `deploy-cloudflare.yml` applies the environment's SQL migrations and deploys previews for branch pushes and pull requests; pushes to `master` deploy production.

For local Pages Functions and D1, run `npm install`, `npm run build`, then `npm run cloudflare:dev`. Run local SQL migrations with `npm run cloudflare:db:migrate:local`. This database is isolated from Cloudflare and is not a copy of staging or production.

## Browser support
- **The app** runs on Chrome/Edge 99+, Firefox 97+ and Safari 15.4+. Vite lowers JS and CSS to these targets in `vite.config.js`.
- **Static fallback**: older browsers (down to Chrome 40) and visitors with JS off get the plain HTML page in `index.html`, styled by `src/styles/legacy-fallback.css`.
