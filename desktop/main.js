const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// -------------------------------
// GLOBALS
// -------------------------------
let mainWindow;

const APP_DATA_FILE = path.join(app.getPath('userData'), 'acode.json');
let permissions = new Set();
let watchers = new Map();

// -------------------------------
// STORAGE
// -------------------------------
function readStore() {
  try {
    if (!fs.existsSync(APP_DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(APP_DATA_FILE, 'utf-8'));
  } catch (e) {
    console.error("Read store error:", e);
    return {};
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(APP_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Write store error:", e);
  }
}

// -------------------------------
// WINDOW
// -------------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../www/index.html'));
}

app.whenReady().then(createWindow);

// -------------------------------
// HELPERS
// -------------------------------
function safeStat(fullPath) {
  try {
    const stat = fs.statSync(fullPath);
    return {
      size: stat.size,
      mtime: stat.mtimeMs,
      isDir: stat.isDirectory()
    };
  } catch {
    return null;
  }
}

function hasPermission(targetPath) {
  return permissions.has(targetPath);
}

// -------------------------------
// DIALOGS
// -------------------------------
ipcMain.handle('open-file-dialog', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  return res.canceled ? null : res.filePaths[0];
});

ipcMain.handle('save-file-dialog', async (_, defaultPath) => {
  const res = await dialog.showSaveDialog({ defaultPath });
  return res.canceled ? null : res.filePath;
});

// -------------------------------
// FILE IO
// -------------------------------
ipcMain.handle('read-file', async (_, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle('write-file', async (_, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data);
    return true;
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle('exists', async (_, p) => {
  return fs.existsSync(p);
});

// -------------------------------
// DIRECTORY LISTING (with metadata)
// -------------------------------
ipcMain.handle('read-dir', async (_, dirPath) => {
  try {
    return fs.readdirSync(dirPath).map(name => {
      const full = path.join(dirPath, name);
      const stat = safeStat(full);

      return {
        name,
        path: full,
        type: stat?.isDir ? 'folder' : 'file',
        size: stat?.size || 0,
        modified: stat?.mtime || 0
      };
    });
  } catch (e) {
    return { error: e.message };
  }
});

// -------------------------------
// FILE TREE (recursive)
// -------------------------------
ipcMain.handle('fs-tree', async (_, dirPath) => {
  try {
    function walk(dir) {
      return fs.readdirSync(dir).map(name => {
        const full = path.join(dir, name);
        const stat = safeStat(full);

        return {
          name,
          path: full,
          type: stat?.isDir ? 'folder' : 'file',
          children: stat?.isDir ? walk(full) : []
        };
      });
    }

    return walk(dirPath);
  } catch (e) {
    return { error: e.message };
  }
});

// -------------------------------
// PERMISSIONS (improved)
// -------------------------------
ipcMain.handle('perm-request', async (_, type, targetPath) => {
  permissions.add(targetPath);
  return true;
});

ipcMain.handle('perm-check', async (_, targetPath) => {
  return permissions.has(targetPath);
});

// -------------------------------
// FILE WATCHER (safe + reusable)
// -------------------------------
ipcMain.handle('watch-file', (_, filePath) => {
  try {
    if (watchers.has(filePath)) return true;

    const watcher = fs.watch(filePath, { persistent: false }, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('file-changed', filePath);
      }
    });

    watchers.set(filePath, watcher);
    return true;
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle('unwatch-file', (_, filePath) => {
  if (watchers.has(filePath)) {
    watchers.get(filePath).close();
    watchers.delete(filePath);
  }
  return true;
});

// -------------------------------
// APP STATE (tabs/plugins)
// -------------------------------
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

// -------------------------------
// DRAG & DROP SUPPORT
// -------------------------------
ipcMain.handle('read-file-path', async (_, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return { error: e.message };
  }
});

// -------------------------------
// CLEANUP
// -------------------------------
app.on('before-quit', () => {
  watchers.forEach(w => w.close());
  watchers.clear();
});

// -------------------------------
// APP EVENTS
// -------------------------------
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
