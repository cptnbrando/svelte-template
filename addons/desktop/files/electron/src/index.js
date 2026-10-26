// Desktop shell: an Electron window around the web app. `npm run desktop:sync` builds the web app and Capacitor
// copies it into electron/app/, served here on app://-/. `npm run desktop:dev` loads the Vite dev server instead,
// so Svelte edits hot-reload in the window. Plain CommonJS, no build step.
const { app, BrowserWindow, Menu, net, protocol, session, shell } = require('electron');
const { readFileSync } = require('fs');
const { join, normalize, sep } = require('path');
const { pathToFileURL } = require('url');
const { setupPlugins } = require('./plugins');

const ROOT_DIR = app.getAppPath();
const WEB_DIR = join(ROOT_DIR, 'app');
const CAPACITOR_CONFIG = JSON.parse(readFileSync(join(ROOT_DIR, 'capacitor.config.json'), 'utf8'));
const APP_SCHEME = 'app';
const APP_URL = `${APP_SCHEME}://-/index.html`;
const DEV_URL_FLAG = '--dev-url=';
const DEV_URL = process.argv.find((arg) => arg.startsWith(DEV_URL_FLAG))?.slice(DEV_URL_FLAG.length);
const START_URL = DEV_URL ?? APP_URL;
const START_ORIGIN = new URL(START_URL).origin;
const ICON_FILE = join(ROOT_DIR, 'assets', process.platform === 'win32' ? 'appIcon.ico' : 'appIcon.png');
// Small enough to check the mobile layouts from AGENTS.md inside the window
const WINDOW_SIZE = { width: 1280, height: 800, minWidth: 320, minHeight: 320 };
// --color-app from src/styles/theme.css, so the window never flashes white before the page paints
const BACKGROUND_COLOR = '#050508';
// 'self' is app://- in a build and the Vite dev server in desktop:dev. The inline script is index.html's legacy check.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https: ws://localhost:*",
].join('; ');
const NOT_FOUND = { status: 404 };

// Must run before the app is ready: lets app:// load modules, use fetch and count as a secure origin
protocol.registerSchemesAsPrivileged([
  { scheme: APP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

/** Serves the synced web build from electron/app/ on app://-/, with the CSP attached. */
function serveWebBuild() {
  protocol.handle(APP_SCHEME, async (request) => {
    const file = normalize(join(WEB_DIR, decodeURIComponent(new URL(request.url).pathname)));
    if (!file.startsWith(WEB_DIR + sep)) return new Response('Not found', NOT_FOUND);
    const response = await net.fetch(pathToFileURL(file).toString()).catch(() => null);
    if (!response?.ok) return new Response('Not found', NOT_FOUND);
    const headers = new Headers(response.headers);
    headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    return new Response(response.body, { status: response.status, headers });
  });
}

/** Opens the main window. External links go to the system browser; the window only ever shows the app. */
async function createWindow() {
  const window = new BrowserWindow({
    ...WINDOW_SIZE,
    title: CAPACITOR_CONFIG.appName,
    icon: ICON_FILE,
    backgroundColor: BACKGROUND_COLOR,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  window.once('ready-to-show', () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== START_ORIGIN) event.preventDefault();
  });
  await window.loadURL(START_URL);
}

app.whenReady().then(() => {
  // Packaged builds drop the File/Edit/View menu bar on Windows and Linux; dev keeps it for reload and DevTools
  if (app.isPackaged && process.platform !== 'darwin') Menu.setApplicationMenu(null);
  // The Vite dev server sends no CSP, so desktop:dev adds the same one the build gets
  if (DEV_URL) {
    session.defaultSession.webRequest.onHeadersReceived({ urls: [`${START_ORIGIN}/*`] }, (details, callback) => {
      callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [CONTENT_SECURITY_POLICY] } });
    });
  }
  serveWebBuild();
  setupPlugins(CAPACITOR_CONFIG);
  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length || createWindow());
});

// macOS apps stay open in the dock after their last window closes
app.on('window-all-closed', () => process.platform === 'darwin' || app.quit());
