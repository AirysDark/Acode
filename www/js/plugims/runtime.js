// www/js/plugins/runtime.js

export const PluginAPI = {
  // ==============================
  // FILE SYSTEM
  // ==============================
  fs: {
    async read(path) {
      try {
        return await window.api.readFile(path);
      } catch (e) {
        console.error("FS read error:", e);
        throw e;
      }
    },

    async write(path, data) {
      try {
        return await window.api.writeFile(path, data);
      } catch (e) {
        console.error("FS write error:", e);
        throw e;
      }
    },

    async readDir(path) {
      try {
        return await window.api.readDir(path);
      } catch (e) {
        console.error("FS readDir error:", e);
        return [];
      }
    },

    async exists(path) {
      try {
        return await window.api.exists(path);
      } catch {
        return false;
      }
    },

    async watch(path, callback) {
      window.api.watchFile(path);
      window.api.onFileChanged((changedPath) => {
        if (changedPath === path) callback(changedPath);
      });
    }
  },

  // ==============================
  // UI SYSTEM
  // ==============================
  ui: {
    notify(message, type = "info") {
      console.log(`[PLUGIN:${type}]`, message);

      // Basic fallback
      if (typeof window.showToast === "function") {
        window.showToast(message, type);
      } else {
        alert(message);
      }
    },

    async openFileDialog() {
      return await window.api.openFileDialog();
    },

    async saveFileDialog(defaultPath = "untitled.txt") {
      return await window.api.saveFileDialog(defaultPath);
    },

    async prompt(title, defaultValue = "") {
      return prompt(title, defaultValue);
    }
  },

  // ==============================
  // STORAGE
  // ==============================
  storage: {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return localStorage.getItem(key);
      }
    },

    set(key, value) {
      if (typeof value === "object") {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    },

    remove(key) {
      localStorage.removeItem(key);
    },

    clear() {
      localStorage.clear();
    }
  },

  // ==============================
  // APP STATE (persistent via Electron)
  // ==============================
  app: {
    async get(key) {
      return await window.api.getAppData(key);
    },

    async set(key, value) {
      return await window.api.setAppData(key, value);
    }
  },

  // ==============================
  // PERMISSIONS
  // ==============================
  permissions: {
    async request(type, path) {
      return await window.api.requestPermission(type, path);
    },

    async check(path) {
      return await window.api.checkPermission(path);
    }
  },

  // ==============================
  // EVENTS
  // ==============================
  events: {
    onFileChanged(callback) {
      window.api.onFileChanged(callback);
    },

    onReady(callback) {
      if (document.readyState === "complete") {
        callback();
      } else {
        window.addEventListener("load", callback);
      }
    }
  },

  // ==============================
  // UTILITIES
  // ==============================
  utils: {
    log(...args) {
      console.log("[PLUGIN]", ...args);
    },

    error(...args) {
      console.error("[PLUGIN ERROR]", ...args);
    }
  }
};
