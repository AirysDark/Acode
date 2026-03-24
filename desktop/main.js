const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const APP_DATA_FILE = path.join(app.getPath('userData'), 'acode.json');

function readStore() {
  try { return JSON.parse(fs.readFileSync(APP_DATA_FILE, 'utf-8')); }
  catch { return {}; }
}
function writeStore(data) {
  fs.writeFileSync(APP_DATA_FILE, JSON.stringify(data, null, 2));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, '../www/index.html'));
}

app.whenReady().then(createWindow);

// ---------- IPC HANDLERS ----------

// Dialogs
ipcMain.handle('open-file-dialog', async () => {
  const res = await dialog.showOpenDialog({ properties: ['openFile'] });
  return res.canceled ? null : res.filePaths[0];
});

ipcMain.handle('save-file-dialog', async (_, defaultPath) => {
  const res = await dialog.showSaveDialog({ defaultPath });
  return res.canceled ? null : res.filePath;
});

// File IO
ipcMain.handle('read-file', async (_, filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
});

ipcMain.handle('write-file', async (_, filePath, data) => {
  fs.writeFileSync(filePath, data);
  return true;
});

ipcMain.handle('read-dir', async (_, dirPath) => {
  return fs.readdirSync(dirPath);
});

// App data (tabs/session/plugins state)
ipcMain.handle('get-app-data', async (_, key) => {
  const db = readStore();
  return db[key];
});

ipcMain.handle('set-app-data', async (_, key, value) => {
  const db = readStore();
  db[key] = value;
  writeStore(db);
  return true;
});