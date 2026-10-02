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

# Getting Started

git clone this repo
```
git clone https://github.com/cptnbrando/svelte-template.git
```

install
```
cd svelte-template
npm i
```