import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { loginApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('kart_token'));
  const [username, setUsername] = useState(() => sessionStorage.getItem('kart_username'));

  const login = useCallback(async (user, pass) => {
    try {
      const { data } = await loginApi(user, pass);
      sessionStorage.setItem('kart_token', data.token);
      sessionStorage.setItem('kart_username', data.username);
      setToken(data.token);
      setUsername(data.username);
    } catch (err) {
      // Limpar sessionStorage em caso de erro de login
      sessionStorage.removeItem('kart_token');
      sessionStorage.removeItem('kart_username');
      setToken(null);
      setUsername(null);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('kart_token');
    sessionStorage.removeItem('kart_username');
    setToken(null);
    setUsername(null);
  }, []);

  const isAdmin = !!token;

  const value = useMemo(
    () => ({ token, username, isAdmin, login, logout }),
    [token, username, isAdmin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
