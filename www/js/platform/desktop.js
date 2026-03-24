export const platform = {
  isDesktop: typeof window !== 'undefined' && !!window.api,

  async openFile() {
    const path = await window.api.openFileDialog();
    if (!path) return null;
    const content = await window.api.readFile(path);
    return { path, content };
  },

  async saveFile(path, content) {
    let target = path;
    if (!target) {
      target = await window.api.saveFileDialog('untitled.txt');
      if (!target) return null;
    }
    await window.api.writeFile(target, content);
    return target;
  },

  async readDir(path) {
    return window.api.readDir(path);
  },

  async getState(key) {
    return window.api.getAppData(key);
  },

  async setState(key, value) {
    return window.api.setAppData(key, value);
  }
};