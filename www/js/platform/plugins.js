export const plugins = {
  // Example: simple plugin storage
  async get(key) {
    return localStorage.getItem(key);
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  }
};