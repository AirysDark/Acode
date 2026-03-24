// platform/desktop.js

export const platform = {
  isDesktop: typeof window !== 'undefined' && !!window.api,

  // -----------------------------
  // FILE OPERATIONS
  // -----------------------------
  async openFile() {
    if (!this.isDesktop) return null;

    try {
      const filePath = await window.api.openFileDialog();
      if (!filePath) return null;

      const allowed = await window.api.checkPermission?.(filePath);
      if (!allowed) {
        await window.api.requestPermission?.('read', filePath);
      }

      const content = await window.api.readFile(filePath);
      return { path: filePath, content };
    } catch (err) {
      console.error("openFile error:", err);
      return null;
    }
  },

  async saveFile(path, content) {
    if (!this.isDesktop) return null;

    try {
      let target = path;

      if (!target) {
        target = await window.api.saveFileDialog('untitled.txt');
        if (!target) return null;
      }

      const allowed = await window.api.checkPermission?.(target);
      if (!allowed) {
        await window.api.requestPermission?.('write', target);
      }

      await window.api.writeFile(target, content);
      return target;
    } catch (err) {
      console.error("saveFile error:", err);
      return null;
    }
  },

  async readFile(path) {
    if (!this.isDesktop) return null;

    try {
      return await window.api.readFile(path);
    } catch (err) {
      console.error("readFile error:", err);
      return null;
    }
  },

  // -----------------------------
  // DIRECTORY / FILE TREE
  // -----------------------------
  async readDir(path) {
    if (!this.isDesktop) return [];
    try {
      return await window.api.readDir(path);
    } catch (err) {
      console.error("readDir error:", err);
      return [];
    }
  },

  async getFileTree(path) {
    if (!this.isDesktop) return [];
    try {
      return await window.api.fsTree(path);
    } catch (err) {
      console.error("fsTree error:", err);
      return [];
    }
  },

  // -----------------------------
  // STATE (tabs, session, plugins)
  // -----------------------------
  async getState(key) {
    if (!this.isDesktop) {
      return JSON.parse(localStorage.getItem(key) || "null");
    }

    try {
      return await window.api.getAppData(key);
    } catch (err) {
      console.error("getState error:", err);
      return null;
    }
  },

  async setState(key, value) {
    if (!this.isDesktop) {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }

    try {
      return await window.api.setAppData(key, value);
    } catch (err) {
      console.error("setState error:", err);
      return false;
    }
  },

  // -----------------------------
  // PERMISSIONS
  // -----------------------------
  async requestPermission(type, path) {
    if (!this.isDesktop) return true;

    try {
      return await window.api.requestPermission(type, path);
    } catch (err) {
      console.error("requestPermission error:", err);
      return false;
    }
  },

  async checkPermission(path) {
    if (!this.isDesktop) return true;

    try {
      return await window.api.checkPermission(path);
    } catch (err) {
      console.error("checkPermission error:", err);
      return false;
    }
  },

  // -----------------------------
  // DRAG & DROP SUPPORT
  // -----------------------------
  enableDragDrop(callback) {
    if (!this.isDesktop) return;

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', async (e) => {
      e.preventDefault();

      for (const file of e.dataTransfer.files) {
        try {
          const content = await window.api.readFile(file.path);
          callback({
            path: file.path,
            content
          });
        } catch (err) {
          console.error("DragDrop error:", err);
        }
      }
    });
  },

  // -----------------------------
  // FILE WATCHER (live updates)
  // -----------------------------
  watchFile(path, callback) {
    if (!this.isDesktop) return;

    try {
      window.api.watchFile?.(path);

      window.api.onFileChanged?.((changedPath) => {
        if (changedPath === path) {
          callback(changedPath);
        }
      });
    } catch (err) {
      console.error("watchFile error:", err);
    }
  },

  // -----------------------------
  // UTIL
  // -----------------------------
  async exists(path) {
    if (!this.isDesktop) return false;

    try {
      return await window.api.exists?.(path);
    } catch {
      return false;
    }
  }
};
