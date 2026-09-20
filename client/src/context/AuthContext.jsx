import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((payload) => {
    setUser(payload.user);
    setRole(payload.role);
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authService.getMe();
      applySession(response.data.data);
    } catch (_userError) {
      try {
        const response = await authService.getAdminMe();
        applySession(response.data.data);
      } catch (_adminError) {
        setUser(null);
        setRole(null);
      }
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => { refreshSession(); }, [refreshSession]);

  const signOut = useCallback(async () => {
    try { await authService.logout(); } finally {
      setUser(null);
      setRole(null);
    }
  }, []);

  const value = useMemo(() => ({
    user, role, loading, setSession: applySession, refreshSession, signOut
  }), [user, role, loading, applySession, refreshSession, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

