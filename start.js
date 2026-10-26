// DOGS app setup. Run once in a fresh copy of the template: `node start.js`.
// Asks what the new app is, fills in package.json, index.html, the manifest, README.md and AGENTS.md, optionally
// adds the Capacitor desktop shell (addons/desktop/), then deletes itself and addons/ so the app starts clean.
// Node built-ins only, so it runs before `npm install`.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { createInterface } from 'node:readline';

const ROOT = import.meta.dirname;
const ADDONS_DIR = join(ROOT, 'addons');
const DESKTOP_DIR = join(ADDONS_DIR, 'desktop');
const GIT_POLICIES = JSON.parse(readFileSync(join(ADDONS_DIR, 'agents', 'git-policies.json'), 'utf8'));
const SETUP_PATHS = ['start.js', 'start.ps1', 'start.sh', 'addons'];
// Files that carry __APP_*__ placeholders once the desktop shell is copied in
const DESKTOP_TEMPLATED_FILES = [
  'capacitor.config.json',
  'electron/capacitor.config.json',
  'electron/package.json',
  'electron/electron-builder.config.json',
];
const TEMPLATE_REMOTE_HINT = 'svelte-template';
const APP_ID_PREFIX = 'net.wearedogs.';
const DATA_RULE = 'Stay inside the free tier: cache responses, lazy load, and keep data locally so each visitor makes as few requests as possible.';
const TEMPLATE_CREDIT = 'Created from the DOGS Svelte template: Vite, Svelte 5, Tailwind CSS v4, JavaScript with JSDoc.';
const MARKER = (name) => new RegExp(`<!-- setup:${name} -->\\n?([\\s\\S]*?)<!-- /setup:${name} -->\\n?`);
const COLOR = { cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', dim: '\x1b[2m', reset: '\x1b[0m' };

// Answers are read from a queue, so piped input (`node start.js < answers.txt`) works as well as a terminal
const rl = createInterface({ input: process.stdin, output: process.stdout });
const pendingLines = [];
const waiting = [];
let inputClosed = false;
rl.on('line', (line) => (waiting.length ? waiting.shift()(line) : pendingLines.push(line)));
rl.on('close', () => {
  inputClosed = true;
  waiting.splice(0).forEach((resolve) => resolve(''));
});

/**
 * Asks one question and resolves with the trimmed answer, or `fallback` when it is left blank.
 * @param {string} question
 * @param {string} [fallback]
 */
async function ask(question, fallback = '') {
  process.stdout.write(`${question}${fallback ? ` ${COLOR.dim}(${fallback})${COLOR.reset}` : ''}: `);
  if (pendingLines.length) return pendingLines.shift().trim() || fallback;
  if (inputClosed) return fallback;
  return (await new Promise((resolve) => waiting.push(resolve))).trim() || fallback;
}

/**
 * Yes/no question.
 * @param {string} question
 * @param {boolean} fallback Answer used when left blank.
 */
async function confirm(question, fallback) {
  return /^y/i.test(await ask(`${question} [${fallback ? 'Y/n' : 'y/N'}]`, fallback ? 'y' : 'n'));
}

/**
 * Replaces __APP_*__ placeholders in a file, escaping values for JSON files.
 * @param {string} file Path relative to the project root.
 * @param {Record<string, string>} values Placeholder name -> value.
 */
function fillPlaceholders(file, values) {
  const path = join(ROOT, file);
  const escape = extname(file) === '.json' ? (value) => JSON.stringify(value).slice(1, -1) : (value) => value;
  const text = readFileSync(path, 'utf8').replace(/__APP_[A-Z]+__/g, (token) => escape(values[token] ?? token));
  writeFileSync(path, text);
}

/** Copies the desktop shell and the build workflow in, and merges its scripts and packages into package.json. */
function addDesktop(pkg, values) {
  cpSync(join(DESKTOP_DIR, 'files'), ROOT, { recursive: true });
  DESKTOP_TEMPLATED_FILES.forEach((file) => fillPlaceholders(file, values));
  const extra = JSON.parse(readFileSync(join(DESKTOP_DIR, 'package.json'), 'utf8'));
  for (const field of Object.keys(extra)) pkg[field] = { ...pkg[field], ...extra[field] };
}

/**
 * Writes AGENTS.md: the app's own Project section, the chosen git policy and, with the desktop shell, its rules.
 * @param {{ title: string, name: string, description: string, statements: string[], dataUrl: string, gitRule: string, desktop: boolean }} app
 */
function writeAgents(app) {
  const project = [
    '## Project',
    `- **Name**: ${app.title} (\`${app.name}\`)`,
    `- **What it is**: ${app.description}`,
    ...app.statements.map((statement) => `- ${statement}`),
    ...(app.dataUrl ? [`- **Data**: Loaded from ${app.dataUrl}. ${DATA_RULE}`] : []),
    `- ${TEMPLATE_CREDIT}`,
  ].join('\n');
  const desktop = app.desktop ? readFileSync(join(DESKTOP_DIR, 'agents-section.md'), 'utf8') : '';
  const path = join(ROOT, 'AGENTS.md');
  const text = readFileSync(path, 'utf8')
    .replace(MARKER('project'), () => `${project}\n`)
    .replace(MARKER('git'), () => `- ${app.gitRule}\n`)
    .replace(MARKER('desktop'), () => desktop);
  writeFileSync(path, text);
}

/** Points the page title, description and web manifest at the new app. */
function writePageMeta(title, description) {
  const html = description.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const indexPath = join(ROOT, 'index.html');
  const index = readFileSync(indexPath, 'utf8')
    .replace(/<title>[^<]*<\/title>/, () => `<title>${title.replace(/</g, '&lt;')}</title>`)
    .replace(/(<meta name="description"\s+content=")[^"]*"/, (_match, start) => `${start}${html}"`);
  writeFileSync(indexPath, index);
  const manifestPath = join(ROOT, 'public', 'site.webmanifest');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  writeFileSync(manifestPath, `${JSON.stringify({ ...manifest, name: title, short_name: title }, null, 2)}\n`);
}

/** True when this folder is still a clone of the template repo itself, not a new app. */
function isTemplateClone() {
  try {
    return execSync('git remote get-url origin', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .includes(TEMPLATE_REMOTE_HINT);
  } catch {
    return false;
  }
}

async function main() {
  console.log(`\n${COLOR.cyan}--- DOGS app setup ---${COLOR.reset}\n`);
  if (!existsSync(ADDONS_DIR)) return console.log('Setup already ran here: addons/ is gone.');
  if (isTemplateClone() && !(await confirm('This folder still points at the svelte-template repo. Set it up as a new app anyway?', false))) {
    return console.log('Nothing changed.');
  }

  const name = (await ask('Package name', basename(ROOT))).toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const title = await ask('App title (browser tab, window, installer)', name);
  const description = await ask('One-line description', `${title}, made by DOGS.`);

  console.log(`\n${COLOR.yellow}Desktop app${COLOR.reset}: Capacitor + Electron shell, Windows installers and web builds from a manually triggered GitHub Action.`);
  const desktop = await confirm('Add the desktop app?', false);

  console.log(`\n${COLOR.yellow}Git workflow${COLOR.reset} for AI agents (goes in AGENTS.md):`);
  GIT_POLICIES.forEach((policy, i) => console.log(`  ${i + 1}. ${policy.label}`));
  const policyIndex = Number(await ask('Pick one', '1')) - 1;
  const gitRule = (GIT_POLICIES[policyIndex] ?? GIT_POLICIES[0]).rule;

  const statements = [];
  let dataUrl = '';
  console.log('');
  if (await confirm('Add app details to AGENTS.md?', true)) {
    console.log(`${COLOR.dim}One statement per line, e.g. "Audio player for DOGS radio; playback must survive tab switches." Blank line to finish.${COLOR.reset}`);
    for (let statement = await ask('Statement'); statement; statement = await ask('Another statement')) statements.push(statement);
    dataUrl = await ask('Data source URL (blank for none)');
  }
  rl.close();

  const values = {
    __APP_NAME__: name,
    __APP_TITLE__: title,
    __APP_DESCRIPTION__: description,
    __APP_ID__: APP_ID_PREFIX + name.replace(/[^a-z0-9]/g, '').replace(/^(?=\d|$)/, 'app'),
  };
  const pkgPath = join(ROOT, 'package.json');
  const { name: _templateName, description: _templateDescription, ...templatePkg } = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const pkg = { name, description, ...templatePkg };
  if (desktop) addDesktop(pkg, values);
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  writePageMeta(title, description);
  writeAgents({ title, name, description, statements, dataUrl, gitRule, desktop });
  const readme = readFileSync(join(ADDONS_DIR, 'app-readme.md'), 'utf8') + (desktop ? readFileSync(join(DESKTOP_DIR, 'readme-section.md'), 'utf8') : '');
  writeFileSync(join(ROOT, 'README.md'), readme);
  fillPlaceholders('README.md', values);
  SETUP_PATHS.forEach((path) => rmSync(join(ROOT, path), { recursive: true, force: true }));

  console.log(`\n${COLOR.green}${title} is ready.${COLOR.reset} Next:`);
  console.log('  npm install');
  if (desktop) console.log('  npm run desktop:setup');
  console.log('  npm run dev\n');
}

main().finally(() => rl.close());
