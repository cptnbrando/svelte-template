# AGENTS.md

Rules for every AI agent working in this repository.

<!-- setup:project -->
## Project
- **Name**: DOGS Svelte Template
- **What it is**: The starter every DOGS app is created from. `node start.js` turns a fresh copy into a new app: it asks for the app's details, optionally adds the Capacitor desktop shell from `addons/desktop/`, fills in this file, then deletes itself and `addons/`.
- Keep `start.js` and `addons/` working whenever the template changes: a new app must come out of setup ready to run.
- **Data**: DOGS apps read their data from Cloudflare R2 at https://data.wearedogs.net. Stay inside the free tier: cache responses, lazy load, and keep data locally so each visitor makes as few requests as possible.
<!-- /setup:project -->

## Privacy
Never write the owner's name, pseudonym, alias, or any personal information anywhere in the repo: code, comments, commits, docs. The company name DOGS is fine everywhere.

## Git workflow
- `master` is the root branch. Start every task from an up-to-date `master` unless told to build on another branch.
- Branch per task, named `[agent]-[month]-[feature-name]`: your agent name in lowercase, the two-digit month, and a short kebab-case feature name. Example: `claude-10-desktop-shell`.
<!-- setup:git -->
- Commit to your feature branch as you go, in small, described steps. When the task is verified, report the branch name so it can be reviewed, pushed and merged.
<!-- /setup:git -->
- Generated data, background-script output and local builds belong in `.gitignore`.

## Stack
- Vite + Svelte 5, **JavaScript only** (no TypeScript). Add JSDoc types to complex functions and components.
- Styling is **Tailwind CSS v4 plus plain CSS**. No SCSS, Sass, Less or other preprocessors.
- Icons come from `@lucide/svelte`, imported one at a time.

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
- **Logic stays out of markup.** State machines and business logic live in plain JS modules or classes next to the component that uses them (e.g. a player's `play()`, `pause()`, `skip()`). They move to `src/lib/` only once more than one component needs them.
- **Reusable UI.** Build standalone components (tabbed nav, dial, sliding panel, custom scrollbar) and reuse them rather than copying markup.
- **Strings.** Lists of more than 10 UI strings or items go in `.json` files beside their component, ready for translation.

## Theme and styles
- All colors, theme tokens, fonts and custom breakpoint variants live in the top-level style folder, `src/styles/`. Tokens go in `src/styles/theme.css` as Tailwind `@theme` variables (`--color-neon-red` becomes `text-neon-red`, `bg-neon-red/20`).
- Components use those tokens. No hex, rgb or hsl values in `.svelte` or `.js` files, and no arbitrary color utilities like `bg-[#050508]`.
- Tailwind does the layout and most styling. Plain CSS (in `src/styles/` or a component `<style>` block) is for what Tailwind can't express: keyframes, complex selectors, browser fallbacks.
- Comment each token with what it is for and where it is used.

## Responsive layouts
Every screen gets its own deliberate layout on each of these displays. Mobile portrait and mobile landscape are different layouts, not one stretched layout. A change isn't finished until every row below has been checked in the browser.

| Display | Tailwind | Layout |
|---|---|---|
| Mobile portrait | base (no prefix) | One stacked column, main navigation at the bottom within thumb reach. |
| Mobile landscape | `sm:` and `short:` | Two compact columns or a sideways swipe list. No stacked headers; give the height to content. |
| Tablet portrait | `md:` | Grid of 3 or more columns, persistent side rail. |
| Tablet landscape | `lg:` | Wider grid of 3 or more columns, side rail. |
| Desktop landscape | `xl:` | Full dashboard layout, content capped at `max-w-7xl`. |
| Desktop portrait | `xl:` with `portrait:` | Tall monitors: stack the dashboard into rows instead of stretching columns. |
| TV | `2xl:` | Large type and spacing for 10-foot viewing; master-detail or multi-panel views. |
| Ultra-wide | `ultrawide:` (21:9 and wider) | Spread panels sideways so the screen has no empty bleed. |

- Every component sets visibility, grid columns or flex direction explicitly for these modes.
- Fit on one screen. Pages, panels and apps show everything on load without scrolling. Vertical scrolling is allowed only inside lists.
- **Never a horizontal scrollbar.** Content that scrolls sideways hides its scrollbar and shows arrow buttons, and also responds to swipe, drag and scroll wheel.
- Nothing is cropped or unreachable at any size, down to a 320×320 window.

## Layout stability
- Core branding (the DOGS / WEAREDOGS lettering) stays as still as an oil painting. Elements entering, animating or leaving must never shift layout, move neighbors or jitter text. Reserve space up front; animate with `transform` and `opacity`.
- Use each device's own controls: back-swipe on mobile, scroll wheel on desktop, touch-and-hold, and keyboard and remote focus on TVs. Keep it accessible: semantic markup, ARIA only where needed, visible focus states, no keyboard traps.

## Browser support (the Potato Target)
- **The app** runs on Chrome/Edge 99+, Firefox 97+ and Safari 15.4+. Vite lowers JS and CSS to these targets (`vite.config.js`); no polyfill packages.
- **The static fallback** in `index.html` (styles in `src/styles/legacy-fallback.css`) covers everything older, down to Chrome 40, and visitors with JS off. It stays plain HTML and ES5, and its text mirrors the app.
- Use modern features where they pay off. The fallback is how old devices stay covered.

## Svelte
- A `svelte-ignore` comment needed by several elements goes once at the top of the component, not repeated on each element.
- Zero warnings: the dev server, the Svelte compiler and the browser console stay free of errors and warnings. A warning is a bug that hasn't happened yet.

## Verifying work
- `npm run dev` is usually already running in the owner's terminal (http://localhost:5173). Use it rather than starting another server or running `npm run build` to check a change.
- Before calling a task done, load the site and check every display in the table above, the console, and the layout for cropped or unreachable content.
- Tests: no unit tests for ordinary code unless asked. When a change touches the landing page, check that the branding lettering hasn't moved by a single pixel.
- Add JSDoc only to new classes, methods and main utility functions, inline and short.
<!-- setup:desktop -->
<!-- /setup:desktop -->
