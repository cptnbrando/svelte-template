// Capacitor plugins with an Electron implementation, run in the main process. `npx cap sync
// @capacitor-community/electron` lists them in rt/electron-plugins.js; preload.js forwards the page's calls here.
const { ipcMain } = require('electron');
const { EventEmitter } = require('events');
const PLUGIN_MODULES = require('./rt/electron-plugins');

const MANIFEST_CHANNEL = 'capacitor:plugins';

/**
 * Instantiates every plugin class and answers its method calls and event subscriptions over IPC.
 * @param {object} capacitorConfig Parsed capacitor.config.json, handed to each plugin like Capacitor does.
 */
function setupPlugins(capacitorConfig) {
  /** @type {Record<string, { methods: string[], events: boolean }>} */
  const manifest = {};
  for (const exports of Object.values(PLUGIN_MODULES)) {
    for (const [className, PluginClass] of Object.entries(exports)) {
      if (className === 'default') continue;
      const plugin = new PluginClass(structuredClone(capacitorConfig));
      const methods = Object.getOwnPropertyNames(PluginClass.prototype).filter((name) => name !== 'constructor');
      for (const method of methods) ipcMain.handle(`${className}-${method}`, (_event, ...args) => plugin[method](...args));
      manifest[className] = { methods, events: plugin instanceof EventEmitter };
      if (!manifest[className].events) continue;
      ipcMain.on(`event-add-${className}`, (event, type) => {
        const forward = (...args) => event.sender.send(`event-${className}-${type}`, ...args);
        plugin.addListener(type, forward);
        ipcMain.once(`event-remove-${className}-${type}`, () => plugin.removeListener(type, forward));
      });
    }
  }
  // The sandboxed preload can't require plugin files, so it asks for this list instead
  ipcMain.on(MANIFEST_CHANNEL, (event) => (event.returnValue = manifest));
}

module.exports = { setupPlugins };
