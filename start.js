// DOGS app setup. Run once in a fresh copy of the template: `node start.js`.
// Asks what the new app is, selects target platforms, writes project files, then removes setup-only files.
// Node built-ins only, so it runs before `npm install`.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { createInterface, emitKeypressEvents } from 'node:readline';

const ROOT = import.meta.dirname;
const ADDONS_DIR = join(ROOT, 'addons');
const DESKTOP_DIR = join(ADDONS_DIR, 'desktop');
const CLOUDFLARE_DIR = join(ADDONS_DIR, 'cloudflare');
const GIT_POLICIES = JSON.parse(readFileSync(join(ADDONS_DIR, 'agents', 'git-policies.json'), 'utf8'));
const SETUP_PATHS = ['start.js', 'start.ps1', 'start.sh', 'addons'];
const PLATFORMS = [
  { label: 'web', value: 'web' },
  { label: 'android', value: 'android' },
  { label: 'iOS app', value: 'ios' },
  { label: 'windows', value: 'windows' },
  { label: 'mac OS X', value: 'macos' },
  { label: 'linux', value: 'linux' },
];
const ALL_PLATFORMS_OPTION = { label: 'all', value: 'all' };
const TEMPLATE_REMOTE_HINT = 'svelte-template';
const ROOT_BRANCH = 'master';
const FORBIDDEN_BRANCH = 'main';
const APP_ID_PREFIX = 'net.dogs.';
const DEFAULT_CLOUDFLARE_NAME = 'dogs-app';
const DATA_RULE = 'Stay inside the free tier: cache responses, lazy load, and keep data locally so each visitor makes as few requests as possible.';
const TEMPLATE_CREDIT = 'Created from the DOGS Svelte template.';
const MARKER = (name) => new RegExp(`<!-- setup:${name} -->\\n?([\\s\\S]*?)<!-- /setup:${name} -->\\n?`);
const COLOR = { cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', dim: '\x1b[2m', reset: '\x1b[0m' };

const ANSI = { up: (lines) => `\x1b[${lines}A`, clearLine: '\x1b[2K', hideCursor: '\x1b[?25l', showCursor: '\x1b[?25h' };
const EXIT_CODE_INTERRUPTED = 130;
const DEFAULT_PLATFORMS = ['web'];

// A terminal gets one short-lived readline per question, which frees stdin for the checkbox list in between.
// Piped input (`node start.js < answers.txt`) is read ahead into a queue by one long-lived readline instead.
const IS_TERMINAL = Boolean(process.stdin.isTTY && process.stdout.isTTY);
const pendingLines = [];
const waiting = [];
let inputClosed = false;
const pipedInput = IS_TERMINAL ? null : createInterface({ input: process.stdin });
pipedInput?.on('line', (line) => (waiting.length ? waiting.shift()(line) : pendingLines.push(line)));
pipedInput?.on('close', () => {
  inputClosed = true;
  waiting.splice(0).forEach((resolve) => resolve(''));
});

/** Reads one line from the terminal, exiting cleanly on Ctrl+C. */
function readTerminalLine() {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  prompt.on('SIGINT', () => process.exit(EXIT_CODE_INTERRUPTED));
  return new Promise((resolve) => prompt.once('line', (line) => {
    prompt.close();
    resolve(line);
  }));
}

/**
 * Asks one question and resolves with the trimmed answer, or `fallback` when it is left blank.
 * @param {string} question
 * @param {string} [fallback]
 */
async function ask(question, fallback = '') {
  process.stdout.write(`${question}${fallback ? ` ${COLOR.dim}(${fallback})${COLOR.reset}` : ''}: `);
  if (IS_TERMINAL) return (await readTerminalLine()).trim() || fallback;
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
  const escape = ['.json', '.jsonc', '.toml'].includes(extname(file)) ? (value) => JSON.stringify(value).slice(1, -1) : (value) => value;
  const text = readFileSync(path, 'utf8').replace(/__APP_[A-Z]+__/g, (token) => escape(values[token] ?? token));
  writeFileSync(path, text);
}

/** Copies the Tauri shell and merges its scripts and dependencies into the app. */
function addDesktop(pkg, values, platforms) {
  cpSync(join(DESKTOP_DIR, 'files'), ROOT, { recursive: true });
  fillPlaceholders('src/tauri/tauri.conf.json', values);
  writeBuildWorkflow(platforms);
  const extra = JSON.parse(readFileSync(join(DESKTOP_DIR, 'package.json'), 'utf8'));
  for (const field of Object.keys(extra)) pkg[field] = { ...pkg[field], ...extra[field] };
  pkg.scripts['tauri:build:platforms'] = `node scripts/build-platforms.js ${platforms.filter((platform) => platform !== 'web').join(' ')}`;
  const scriptDir = join(ROOT, 'scripts');
  mkdirSync(scriptDir, { recursive: true });
  writeFileSync(join(scriptDir, 'build-platforms.js'), `import { spawnSync } from 'node:child_process';\n\nconst COMMANDS = { android: ['tauri', 'android', ['build']], ios: ['tauri', 'ios', ['build']], macos: ['tauri', 'build', []], windows: ['tauri', 'build', []], linux: ['tauri', 'build', []] };\nconst selected = process.argv.slice(2).filter((platform) => Object.hasOwn(COMMANDS, platform));\nfor (const platform of selected) {\n  const [command, subcommand, args] = COMMANDS[platform];\n  const result = spawnSync('npx', [command, subcommand, ...args], { stdio: 'inherit', shell: process.platform === 'win32' });\n  if (result.status !== 0) process.exit(result.status ?? 1);\n}\n`);
}

/** Adds the Pages Functions, D1 bindings, local Wrangler commands, and environment deploy workflow. */
function addCloudflare(pkg, app) {
  cpSync(join(CLOUDFLARE_DIR, 'files'), ROOT, { recursive: true });
  fillPlaceholders('api/wrangler.jsonc', app.values);
  fillPlaceholders('.github/workflows/deploy-cloudflare.yml', app.values);
  pkg.scripts['cloudflare:dev'] = 'cd api && npx --yes wrangler pages dev ../dist --persist-to .wrangler/state';
  pkg.scripts['cloudflare:db:migrate:local'] = `cd api && npx --yes wrangler d1 migrations apply ${app.cfName}-production --local --persist-to .wrangler/state`;
}

/** Adds a manually triggered workflow that builds only the selected release targets. */
function writeBuildWorkflow(platforms) {
  const workflowPath = join(ROOT, '.github', 'workflows', 'build-apps.yml');
  if (!existsSync(workflowPath)) {
    mkdirSync(join(ROOT, '.github', 'workflows'), { recursive: true });
    cpSync(join(DESKTOP_DIR, 'files', '.github', 'workflows', 'build-apps.yml'), workflowPath);
  }
  const workflow = readFileSync(workflowPath, 'utf8').replace('__PLATFORMS_JSON__', JSON.stringify(platforms));
  writeFileSync(workflowPath, workflow);
}

/**
 * Interactive checkbox list: up/down (or j/k) moves, space toggles, `a` toggles all, enter confirms.
 * Toggling the "all" row checks or clears every platform.
 * @returns {Promise<string[]>} Selected platform values.
 */
function checkPlatforms() {
  const options = [...PLATFORMS, ALL_PLATFORMS_OPTION];
  const checked = new Set(DEFAULT_PLATFORMS);
  let cursor = 0;
  let hint = '';
  let drawn = 0;
  const allChecked = () => PLATFORMS.every((platform) => checked.has(platform.value));
  const toggleAll = () => {
    const next = !allChecked();
    PLATFORMS.forEach((platform) => (next ? checked.add(platform.value) : checked.delete(platform.value)));
  };
  const render = () => {
    const lines = options.map((option, index) => {
      const isChecked = option === ALL_PLATFORMS_OPTION ? allChecked() : checked.has(option.value);
      const pointer = index === cursor ? `${COLOR.cyan}>${COLOR.reset}` : ' ';
      const box = isChecked ? `${COLOR.green}[x]${COLOR.reset}` : '[ ]';
      return `${pointer} ${box} ${option.label}`;
    });
    lines.push(`${COLOR.dim}${hint || 'up/down move, space toggle, a all, enter confirm'}${COLOR.reset}`);
    const reset = drawn ? ANSI.up(drawn) : '';
    process.stdout.write(reset + lines.map((line) => `${ANSI.clearLine}${line}\n`).join(''));
    drawn = lines.length;
  };

  return new Promise((resolve) => {
    const finish = () => {
      process.stdin.off('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write(ANSI.showCursor);
      resolve(PLATFORMS.filter((platform) => checked.has(platform.value)).map((platform) => platform.value));
    };
    /** @param {string} _text @param {{ name?: string, ctrl?: boolean }} key */
    const onKey = (_text, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        process.stdout.write(ANSI.showCursor);
        process.exit(EXIT_CODE_INTERRUPTED);
      }
      hint = '';
      if (key.name === 'up' || key.name === 'k') cursor = (cursor - 1 + options.length) % options.length;
      if (key.name === 'down' || key.name === 'j') cursor = (cursor + 1) % options.length;
      if (key.name === 'a') toggleAll();
      if (key.name === 'space') {
        const option = options[cursor];
        if (option === ALL_PLATFORMS_OPTION) toggleAll();
        else checked.has(option.value) ? checked.delete(option.value) : checked.add(option.value);
      }
      if (key.name === 'return' || key.name === 'enter') {
        if (checked.size) return finish();
        hint = `${COLOR.yellow}Check at least one platform.${COLOR.reset}`;
      }
      render();
    };
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('keypress', onKey);
    process.stdout.write(ANSI.hideCursor);
    render();
  });
}

/** Asks which platforms to target: a checkbox list in a terminal, comma-separated numbers when input is piped. */
async function selectPlatforms() {
  console.log(`\n${COLOR.yellow}Target platforms${COLOR.reset}`);
  if (IS_TERMINAL) return checkPlatforms();
  const options = [...PLATFORMS, ALL_PLATFORMS_OPTION];
  options.forEach((platform, index) => console.log(`  [ ] ${index + 1}. ${platform.label}`));
  const indexes = new Set((await ask('Select platforms (numbers, comma separated)', '1')).split(',').map((value) => Number(value.trim()) - 1));
  const platforms = indexes.has(options.length - 1) ? PLATFORMS : PLATFORMS.filter((_platform, index) => indexes.has(index));
  PLATFORMS.forEach((platform) => console.log(`  [${platforms.includes(platform) ? 'x' : ' '}] ${platform.label}`));
  return platforms.map((platform) => platform.value);
}

/**
 * Writes AGENTS.md: the app's own Project section, the chosen git policy and, with the desktop shell, its rules.
 * @param {{ title: string, name: string, description: string, statements: string[], dataUrl: string, gitRule: string, platforms: string[] }} app
 */
function writeAgents(app) {
  const project = [
    '## Project',
    `- **Name**: ${app.title} (\`${app.name}\`)`,
    `- **What it is**: ${app.description}`,
    `- **Target platforms**: ${app.platforms.join(', ')}`,
    `- **Main tech stack**: Vite, Svelte 5, Tailwind CSS v4, JavaScript with JSDoc, Cloudflare Workers, D1, R2, Pages${app.platforms.some((platform) => platform !== 'web') ? ', and Tauri 2' : ''}. Database access uses Cloudflare bindings and APIs directly; no ORM.`,
    ...app.statements.map((statement) => `- ${statement}`),
    ...(app.dataUrl ? [`- **Data**: Loaded from ${app.dataUrl}. ${DATA_RULE}`] : []),
    `- ${TEMPLATE_CREDIT}`,
  ].join('\n');
  const desktop = app.platforms.some((platform) => platform !== 'web')
    ? readFileSync(join(DESKTOP_DIR, 'agents-section.md'), 'utf8').replace('__PLATFORMS__', app.platforms.filter((platform) => platform !== 'web').join(', '))
    : '';
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

/** Renames a `main` branch (from `git init` or a host default) to `master`, the only root branch DOGS apps use. */
function useMasterBranch() {
  const git = (command) => execSync(`git ${command}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try {
    if (git('symbolic-ref --short HEAD') !== FORBIDDEN_BRANCH) return;
    git(`branch -m ${FORBIDDEN_BRANCH} ${ROOT_BRANCH}`);
    console.log(`Renamed the ${FORBIDDEN_BRANCH} branch to ${ROOT_BRANCH}.`);
  } catch {
    // Not a git repo, or the rename failed; setup carries on either way.
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

  const platforms = await selectPlatforms();
  if (!platforms.length) return console.log('Choose at least one platform; nothing changed.');
  const nativePlatforms = platforms.filter((platform) => platform !== 'web');

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
  pipedInput?.close();

  const values = {
    __APP_NAME__: name,
    __APP_CFNAME__: name.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || DEFAULT_CLOUDFLARE_NAME,
    __APP_TITLE__: title,
    __APP_DESCRIPTION__: description,
    __APP_ID__: APP_ID_PREFIX + name.replace(/[^a-z0-9]/g, '').replace(/^(?=\d|$)/, 'app'),
  };
  const pkgPath = join(ROOT, 'package.json');
  const { name: _templateName, description: _templateDescription, ...templatePkg } = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const pkg = { name, description, ...templatePkg };
  addCloudflare(pkg, { name, cfName: values.__APP_CFNAME__, values });
  if (nativePlatforms.length) addDesktop(pkg, values, platforms);
  else writeBuildWorkflow(platforms);
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  rmSync(join(ROOT, 'package-lock.json'), { force: true });
  writePageMeta(title, description);
  writeAgents({ title, name, description, statements, dataUrl, gitRule, platforms });
  const readme = readFileSync(join(ADDONS_DIR, 'app-readme.md'), 'utf8') + (nativePlatforms.length ? readFileSync(join(DESKTOP_DIR, 'readme-section.md'), 'utf8').replace('__PLATFORMS__', nativePlatforms.join(', ')) : '');
  writeFileSync(join(ROOT, 'README.md'), readme);
  fillPlaceholders('README.md', values);
  SETUP_PATHS.forEach((path) => rmSync(join(ROOT, path), { recursive: true, force: true }));
  useMasterBranch();

  console.log(`\n${COLOR.green}${title} is ready.${COLOR.reset} Next:`);
  console.log('  npm install');
  if (nativePlatforms.length) console.log('  npm run tauri:dev');
  console.log('  npm run dev\n');
}

main().finally(() => pipedInput?.close());
