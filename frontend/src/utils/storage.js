export const tokenKey = "vv_token";

export const storage = {
  get: () => localStorage.getItem(tokenKey),
  set: (t) => localStorage.setItem(tokenKey, t),
  clear: () => localStorage.removeItem(tokenKey),
};
