// Runs sandboxed before the page. Exposes window.CapacitorCustomPlatform, which @capacitor/core reads to report
// Capacitor.getPlatform() === 'electron' and to send plugin calls over IPC to src/plugins.js.
const { contextBridge, ipcRenderer } = require('electron');

const MANIFEST_CHANNEL = 'capacitor:plugins';
/** @type {Record<string, { methods: string[], events: boolean }>} */
const PLUGIN_MANIFEST = ipcRenderer.sendSync(MANIFEST_CHANNEL);

/**
 * Event subscription calls for one plugin, matching Capacitor's addListener / removeListener API.
 * @param {string} className
 */
function pluginEvents(className) {
  /** @type {Map<string, { type: string, listener: Function }>} */
  const listeners = new Map();
  let nextId = 0;
  const hasType = (type) => [...listeners.values()].some((entry) => entry.type === type);
  const remove = (id) => {
    const { type, listener } = listeners.get(id);
    ipcRenderer.removeListener(`event-${className}-${type}`, listener);
    listeners.delete(id);
    if (!hasType(type)) ipcRenderer.send(`event-remove-${className}-${type}`);
  };
  return {
    addListener(type, callback) {
      if (!hasType(type)) ipcRenderer.send(`event-add-${className}`, type);
      const listener = (_event, ...args) => callback(...args);
      ipcRenderer.addListener(`event-${className}-${type}`, listener);
      const id = String(nextId++);
      listeners.set(id, { type, listener });
      return id;
    },
    removeListener(id) {
      if (!listeners.has(id)) throw new Error('Invalid id');
      remove(id);
    },
    removeAllListeners(type) {
      for (const [id, entry] of listeners) if (!type || entry.type === type) remove(id);
    },
  };
}

const plugins = {};
for (const [className, { methods, events }] of Object.entries(PLUGIN_MANIFEST)) {
  plugins[className] = Object.fromEntries(
    methods.map((method) => [method, (...args) => ipcRenderer.invoke(`${className}-${method}`, ...args)]),
  );
  if (events) Object.assign(plugins[className], pluginEvents(className));
}

contextBridge.exposeInMainWorld('CapacitorCustomPlatform', { name: 'electron', plugins });
