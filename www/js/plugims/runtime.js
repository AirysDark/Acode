export const PluginAPI = {
  fs: {
    read: (path) => window.api.readFile(path),
    write: (path, data) => window.api.writeFile(path, data)
  },

  ui: {
    notify: (msg) => alert(msg)
  },

  storage: {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v)
  }
};
