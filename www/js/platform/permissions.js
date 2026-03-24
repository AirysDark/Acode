// www/js/platform/permissions.js

const isDesktop = typeof window !== "undefined" && !!window.api;

// -----------------------------
// Permission Types
// -----------------------------
export const PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  DIR: "dir"
};

// -----------------------------
// Internal Store (fallback)
// -----------------------------
const localPerms = {};

// -----------------------------
// Normalize paths (Windows safe)
// -----------------------------
function normalizePath(path) {
  if (!path) return "";
  return path.replace(/\\/g, "/").toLowerCase();
}

// -----------------------------
// Check if path is allowed
// -----------------------------
function matchPath(requestPath, storedPath) {
  requestPath = normalizePath(requestPath);
  storedPath = normalizePath(storedPath);

  return requestPath.startsWith(storedPath);
}

// -----------------------------
// Request permission
// -----------------------------
export async function requestPermission(type, targetPath) {
  if (!targetPath) return false;

  // Desktop (Electron IPC)
  if (isDesktop) {
    return await window.api.requestPermission(type, targetPath);
  }

  // Fallback (browser/local)
  if (!localPerms[targetPath]) {
    localPerms[targetPath] = {};
  }

  localPerms[targetPath][type] = true;

  return true;
}

// -----------------------------
// Check permission
// -----------------------------
export async function checkPermission(type, targetPath) {
  if (!targetPath) return false;

  // Desktop
  if (isDesktop) {
    return await window.api.checkPermission(targetPath);
  }

  // Fallback
  for (const storedPath in localPerms) {
    if (matchPath(targetPath, storedPath)) {
      return !!localPerms[storedPath][type];
    }
  }

  return false;
}

// -----------------------------
// Ensure permission (auto request)
// -----------------------------
export async function ensurePermission(type, targetPath) {
  const has = await checkPermission(type, targetPath);
  if (has) return true;

  return await requestPermission(type, targetPath);
}

// -----------------------------
// Remove permission
// -----------------------------
export async function revokePermission(targetPath) {
  if (!targetPath) return;

  if (isDesktop) {
    return await window.api.revokePermission(targetPath);
  }

  delete localPerms[targetPath];
}

// -----------------------------
// List permissions
// -----------------------------
export async function listPermissions() {
  if (isDesktop) {
    return await window.api.listPermissions();
  }

  return localPerms;
}

// -----------------------------
// Debug helper
// -----------------------------
export function debugPermissions() {
  console.log("Permissions:", localPerms);
}
