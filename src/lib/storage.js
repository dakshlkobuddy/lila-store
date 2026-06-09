// Storage: uses the host's window.storage if present (e.g. in an artifact
// runtime); otherwise falls back to the browser's localStorage so the app
// persists when run locally in VS Code.
export const appStorage = (typeof window !== "undefined" && window.storage) ? window.storage : {
  get: async (k, _shared) => { try { const v = localStorage.getItem(k); return v == null ? null : { key: k, value: v }; } catch (_e) { return null; } },
  set: async (k, v, _shared) => { try { localStorage.setItem(k, v); } catch (e) { console.error(e); } return { key: k, value: v }; },
  delete: async (k) => { try { localStorage.removeItem(k); } catch (e) { console.error(e); } return { key: k, deleted: true }; },
  list: async (prefix = "") => { const keys = []; try { for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && key.startsWith(prefix)) keys.push(key); } } catch (e) { console.error(e); } return { keys }; },
};
