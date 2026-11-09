import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True until we know whether a saved token is still good, so protected pages don't flash the login screen.
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi
      .me()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const startSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (credentials) => startSession(await authApi.login(credentials)), [startSession]);
  const register = useCallback(async (details) => startSession(await authApi.register(details)), [startSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/student');
