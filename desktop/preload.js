const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  // -------------------------------
  // FILE DIALOGS
  // -------------------------------
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),

  // -------------------------------
  // FILE IO
  // -------------------------------
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),

  // -------------------------------
  // DIRECTORY
  // -------------------------------
  readDir: (dirPath) => ipcRenderer.invoke('read-dir', dirPath),

  // Full file tree (explorer)
  readTree: (dirPath) => ipcRenderer.invoke('fs-tree', dirPath),

  // -------------------------------
  // PERMISSIONS
  // -------------------------------
  requestPermission: (type, targetPath) =>
    ipcRenderer.invoke('perm-request', type, targetPath),

  checkPermission: (targetPath) =>
    ipcRenderer.invoke('perm-check', targetPath),

  // -------------------------------
  // APP STATE (tabs, session)
  // -------------------------------
  getAppData: (key) => ipcRenderer.invoke('get-app-data', key),
  setAppData: (key, value) => ipcRenderer.invoke('set-app-data', key, value),

  // -------------------------------
  // FILE WATCHER (live reload)
  // -------------------------------
  watchFile: (filePath) => ipcRenderer.invoke('watch-file', filePath),

  onFileChanged: (callback) => {
    ipcRenderer.on('file-changed', (_, filePath) => {
      callback(filePath);
    });
  },

  // -------------------------------
  // DRAG & DROP SUPPORT
  // -------------------------------
  readDroppedFile: (filePath) => ipcRenderer.invoke('read-file', filePath),

  // -------------------------------
  // SYSTEM INFO (optional)
  // -------------------------------
  getPlatform: () => process.platform,
  getHomeDir: () => ipcRenderer.invoke('get-home-dir')

});
