// www/js/platform/desktop.js

export const platform = {
  isDesktop: typeof window !== 'undefined' && !!window.api,

  // =============================
  // INTERNAL HELPERS
  // =============================
  async ensurePermission(type, path) {
    if (!this.isDesktop) return true;

    try {
      const allowed = await window.api.checkPermission?.(path);
      if (allowed) return true;

      return await window.api.requestPermission?.(type, path);
    } catch (err) {
      console.error("Permission error:", err);
      return false;
    }
  },

  safeJSONParse(data) {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  },

  // =============================
  // FILE OPERATIONS
  // =============================
  async openFile() {
    if (!this.isDesktop) return null;

    try {
      const filePath = await window.api.openFileDialog();
      if (!filePath) return null;

      const allowed = await this.ensurePermission('read', filePath);
      if (!allowed) return null;

      const content = await window.api.readFile(filePath);

      return {
        path: filePath,
        content,
        name: filePath.split(/[\\/]/).pop()
      };
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

      const allowed = await this.ensurePermission('write', target);
      if (!allowed) return null;

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
      const allowed = await this.ensurePermission('read', path);
      if (!allowed) return null;

      return await window.api.readFile(path);
    } catch (err) {
      console.error("readFile error:", err);
      return null;
    }
  },

  async writeFile(path, data) {
    if (!this.isDesktop) return false;

    try {
      const allowed = await this.ensurePermission('write', path);
      if (!allowed) return false;

      await window.api.writeFile(path, data);
      return true;
    } catch (err) {
      console.error("writeFile error:", err);
      return false;
    }
  },

  // =============================
  // DIRECTORY / FILE TREE
  // =============================
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

  async createFile(path, content = "") {
    return this.writeFile(path, content);
  },

  async deleteFile(path) {
    if (!this.isDesktop) return false;

    try {
      return await window.api.deleteFile?.(path);
    } catch {
      return false;
    }
  },

  // =============================
  // STATE (tabs, session, plugins)
  // =============================
  async getState(key) {
    if (!this.isDesktop) {
      return this.safeJSONParse(localStorage.getItem(key));
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

  // =============================
  // PERMISSIONS
  // =============================
  async requestPermission(type, path) {
    return this.ensurePermission(type, path);
  },

  async checkPermission(path) {
    if (!this.isDesktop) return true;

    try {
      return await window.api.checkPermission(path);
    } catch {
      return false;
    }
  },

  // =============================
  // DRAG & DROP SUPPORT
  // =============================
  enableDragDrop(callback) {
    if (!this.isDesktop) return;

    const handleDrop = async (e) => {
      e.preventDefault();

      for (const file of e.dataTransfer.files) {
        try {
          const allowed = await this.ensurePermission('read', file.path);
          if (!allowed) continue;

          const content = await window.api.readFile(file.path);

          callback({
            path: file.path,
            content,
            name: file.name
          });
        } catch (err) {
          console.error("DragDrop error:", err);
        }
      }
    };

    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', handleDrop);

    // return cleanup function
    return () => {
      document.removeEventListener('drop', handleDrop);
    };
  },

  // =============================
  // FILE WATCHER (live updates)
  // =============================
  watchFile(path, callback) {
    if (!this.isDesktop) return;

    try {
      window.api.watchFile?.(path);

      const handler = (changedPath) => {
        if (changedPath === path) {
          callback(changedPath);
        }
      };

      window.api.onFileChanged?.(handler);

      return () => {
        // cleanup not fully supported yet but reserved
      };
    } catch (err) {
      console.error("watchFile error:", err);
    }
  },

  // =============================
  // UTILITIES
  // =============================
  async exists(path) {
    if (!this.isDesktop) return false;

    try {
      return await window.api.exists?.(path);
    } catch {
      return false;
    }
  },

  getFileName(path) {
    return path.split(/[\\/]/).pop();
  },

  getDirName(path) {
    return path.split(/[\\/]/).slice(0, -1).join('/');
  }
};
