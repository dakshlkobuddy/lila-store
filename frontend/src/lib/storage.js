// Storage: minimal utility for any remaining client-side preferences.
// All ecommerce data (products, orders, cart, users) now lives in Supabase.
export const appStorage = {
  get: async (k) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? null : { key: k, value: v };
    } catch (_e) { return null; }
  },
  set: async (k, v) => {
    try { localStorage.setItem(k, v); } catch (e) { console.error(e); }
    return { key: k, value: v };
  },
  delete: async (k) => {
    try { localStorage.removeItem(k); } catch (e) { console.error(e); }
    return { key: k, deleted: true };
  },
};
