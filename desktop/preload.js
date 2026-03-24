const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // File dialogs
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),

  // File IO
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),

  // Directory
  readDir: (dirPath) => ipcRenderer.invoke('read-dir', dirPath),

  // App data (for tabs/session)
  getAppData: (key) => ipcRenderer.invoke('get-app-data', key),
  setAppData: (key, value) => ipcRenderer.invoke('set-app-data', key, value)
});