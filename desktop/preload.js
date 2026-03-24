const { contextBridge, ipcRenderer } = require('electron');

// Utility: safe invoke wrapper
const invoke = async (channel, ...args) => {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (err) {
    console.error(`[IPC ERROR] ${channel}`, err);
    throw err;
  }
};

// Track listeners for cleanup
const listeners = new Map();

contextBridge.exposeInMainWorld('api', {

  // ===============================
  // FILE DIALOGS
  // ===============================
  openFileDialog: () => invoke('open-file-dialog'),

  saveFileDialog: (defaultPath) =>
    invoke('save-file-dialog', defaultPath),

  // ===============================
  // FILE IO
  // ===============================
  readFile: (filePath) =>
    invoke('read-file', filePath),

  writeFile: (filePath, data) =>
    invoke('write-file', filePath, data),

  exists: (filePath) =>
    invoke('exists', filePath),

  // ===============================
  // DIRECTORY
  // ===============================
  readDir: (dirPath) =>
    invoke('read-dir', dirPath),

  readTree: (dirPath) =>
    invoke('fs-tree', dirPath),

  // ===============================
  // PERMISSIONS
  // ===============================
  requestPermission: (type, targetPath) =>
    invoke('perm-request', type, targetPath),

  checkPermission: (targetPath) =>
    invoke('perm-check', targetPath),

  // ===============================
  // APP STATE (tabs/session/plugins)
  // ===============================
  getAppData: (key) =>
    invoke('get-app-data', key),

  setAppData: (key, value) =>
    invoke('set-app-data', key, value),

  // ===============================
  // FILE WATCHER
  // ===============================
  watchFile: (filePath) =>
    invoke('watch-file', filePath),

  unwatchFile: (filePath) =>
    invoke('unwatch-file', filePath),

  onFileChanged: (callback) => {
    const handler = (_, filePath) => callback(filePath);

    ipcRenderer.on('file-changed', handler);
    listeners.set(callback, handler);
  },

  offFileChanged: (callback) => {
    const handler = listeners.get(callback);
    if (handler) {
      ipcRenderer.removeListener('file-changed', handler);
      listeners.delete(callback);
    }
  },

  // ===============================
  // DRAG & DROP
  // ===============================
  readDroppedFile: (filePath) =>
    invoke('read-file', filePath),

  // ===============================
  // SYSTEM INFO
  // ===============================
  getPlatform: () => process.platform,

  getHomeDir: () =>
    invoke('get-home-dir'),

  // ===============================
  // EVENTS
  // ===============================
  onAppReady: (callback) => {
    if (document.readyState === 'complete') {
      callback();
    } else {
      window.addEventListener('load', callback);
    }
  },

  // ===============================
  // DEBUG / DEVTOOLS (optional)
  // ===============================
  log: (...args) => console.log('[PRELOAD]', ...args),

  error: (...args) => console.error('[PRELOAD ERROR]', ...args)
});
