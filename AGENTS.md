# AGENTS.md

Rules for every AI agent working in this repository.

## Project
- **Name**: DOGS Svelte Template (`@dogs/svelte-template`)
- **What it is**: The starter every DOGS app is created from. `node start.js` asks for app details and target platforms, creates the app configuration, then removes setup-only files.
- Keep `start.js` and `addons/` working whenever the template changes. A generated app must be ready to install and run.
- DOGS apps may use Cloudflare Workers, D1, and R2. Stay inside the free tier: cache responses, lazy load, and keep data locally so each visitor makes as few requests as possible.
- **Main tech stack**: Vite, Svelte 5, Tailwind CSS v4, JavaScript with JSDoc, Drizzle ORM, Cloudflare serverless services, and optional Tauri 2 native shells.
- Drizzle ORM is the ORM standard; do not add Prisma. Database changes require migrations, and schemas are the single source of truth.
- Keep dependencies current at stable releases when changing them. Prefer small, maintained packages and avoid unnecessary dependencies.
- Website deployments target Cloudflare Pages. Native and web release builds use manually triggered GitHub Actions workflows.
- The generated app may target any selection of Web, Android, iOS, Windows, and Linux. Keep each selected target buildable without requiring unselected targets.

## Privacy
Never write the owner's name, pseudonym, alias, or any personal information anywhere in the repo: code, comments, commits, docs. The company name DOGS is fine everywhere.

## Git workflow
- `master` is the root branch. Start every task from an up-to-date `master` unless told to build on another branch.
- Branch per task, named `[agent]-[month]-[feature-name]`: your agent name in lowercase, the two-digit month, and a short kebab-case feature name. Example: `codex-10-tauri-shell`.
<!-- setup:git -->
- Commit to your feature branch as you go, in small, described steps. When the task is verified, report the branch name so it can be reviewed, pushed and merged.
<!-- /setup:git -->
- Generated data, background-script output and local builds belong in `.gitignore`.

## Stack
- Vite + Svelte 5, **JavaScript only** (no TypeScript). Add concise JSDoc types to complex functions and components.
- Styling is **Tailwind CSS v4 plus plain CSS**. No SCSS, Sass, Less or other preprocessors.
- Icons come from `@lucide/svelte`, imported one at a time.
- Drizzle ORM is used for database access when a database is needed. Keep schemas canonical, generate and commit migrations, and never introduce Prisma.
- Tauri 2 is the native shell. Keep the web build functional on its own and feature-detect native APIs.

## Dependencies
Every dependency is a cost: bundle size, security surface, install scripts and upkeep. Keep the list as short as possible.
- Native browser APIs, Node built-ins and Svelte features come first. If it can be written cleanly in about 20 lines, write it.
- A new package needs a stated reason: what it replaces, its size, and why a native version won't do. Prefer packages with no dependencies and no install scripts.
- Remove packages the moment nothing uses them.

## Code structure
- **Hoist constants.** Every constant goes at the top of its file as a `const` in descriptive SCREAMING_SNAKE_CASE (`const MAX_BPM = 200;`). No magic numbers or raw strings inside logic.
- **Guard clauses first.** Handle failures with early returns, so the main path reads top to bottom and stays unindented.
- **No one-line wrapper functions.** If a function body fits on one line, inline it.
- **1000-line limit per file.** A file that gets close is split into modules before more is added.
- **Logic stays out of markup.** State machines and business logic live in plain JS modules or classes next to the component that uses them. They move to `src/lib/` only once more than one component needs them.
- **Reusable UI.** Build standalone components and reuse them rather than copying markup.
- **Strings.** Lists of more than 10 UI strings or items go in `.json` files beside their component, ready for translation.

## Theme and styles
- All colors, theme tokens, fonts and custom breakpoint variants live in `src/styles/`. Tokens go in `src/styles/theme.css` as Tailwind `@theme` variables.
- Components use those tokens. No hex, rgb or hsl values in `.svelte` or `.js` files, and no arbitrary color utilities like `bg-[#050508]`.
- Tailwind does the layout and most styling. Plain CSS is for what Tailwind can't express: keyframes, complex selectors, browser fallbacks.
- Comment each token with what it is for and where it is used.

## Responsive layouts
Every screen gets its own deliberate layout on mobile portrait, mobile landscape, tablet portrait, tablet landscape, desktop landscape, desktop portrait, TV, and ultra-wide displays. Check the layout at each size before calling a change done.
- Mobile portrait: one stacked column, primary navigation within thumb reach.
- Mobile landscape: compact columns or a sideways swipe list; no stacked headers.
- Tablet portrait and landscape: three or more grid columns with a persistent side rail.
- Desktop landscape: full dashboard capped at `max-w-7xl`; desktop portrait stacks content into rows.
- TV: large type and spacing for 10-foot viewing. Ultra-wide: spread panels to use available width.
- Fit on one screen. Vertical scrolling is allowed only inside lists. Never show a horizontal scrollbar; sideways content must support swipe, drag and scroll wheel and provide controls.
- Nothing is cropped or unreachable at any size, down to a 320×320 window.

## Layout stability and accessibility
- Core branding (the DOGS / WEAREDOGS lettering) stays still. Reserve space for entering, animating, or leaving elements; animate with `transform` and `opacity`.
- Use each device's controls: back-swipe on mobile, scroll wheel on desktop, touch-and-hold, and keyboard and remote focus on TVs. Use semantic markup, ARIA only where needed, visible focus states, and no keyboard traps.

## Browser support (the Potato Target)
- **The app** runs on Chrome/Edge 99+, Firefox 97+ and Safari 15.4+. Vite lowers JS and CSS to these targets (`vite.config.js`); no polyfill packages.
- **The static fallback** in `index.html` (styles in `src/styles/legacy-fallback.css`) covers older browsers down to Chrome 40 and visitors with JS off. It stays plain HTML and ES5, and its text mirrors the app.
- Use modern features where they pay off. The fallback is how old devices stay covered.

## Svelte
- A `svelte-ignore` comment needed by several elements goes once at the top of the component, not repeated on each element. Prefer fixing the problem directly.
- Zero warnings: the dev server, the Svelte compiler and the browser console stay free of errors and warnings.

## Verifying work
- Before calling a task done, load the site and check every display size, the console, and the layout for cropped or unreachable content.
- No unit tests for ordinary code unless asked. When a change touches the landing page, check that the branding lettering hasn't moved by a single pixel.
- Add JSDoc only to new classes, methods and main utility functions, inline and short.

<!-- setup:desktop -->
<!-- /setup:desktop -->
