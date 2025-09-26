import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "../utils/storage.js";
import * as authApi from "../api/auth.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storage.get());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadMe() {
      if (!token) { setUser(null); return; }
      try {
        setLoading(true);
        const me = await authApi.me(token);
        if (!ignore) setUser(me);
      } catch {
        storage.clear();
        setToken(null);
        setUser(null);
      } finally { if (!ignore) setLoading(false); }
    }
    loadMe();
    return () => { ignore = true; };
  }, [token]);

  const login = async (email, password) => {
    const { token: t, user: u } = await authApi.login(email, password);
    storage.set(t); setToken(t); setUser(u);
  };
  const signup = async (name, email, password) => {
    const { token: t, user: u } = await authApi.signup(name, email, password);
    storage.set(t); setToken(t); setUser(u);
  };
  const logout = () => { storage.clear(); setToken(null); setUser(null); };

  const value = useMemo(() => ({ token, user, loading, login, signup, logout }), [token, user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
