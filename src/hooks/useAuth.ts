import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { login as authLogin, logout as authLogout, getSession } from '@/services/auth.service';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';

export function useAuth() {
  const { session, setSession, isAuthenticated, hasRole } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      const s = authLogin(email, password);
      setSession(s);
      toast.success(`Welcome back, ${s.user.firstName}!`);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  }, [setSession, navigate]);

  const logout = useCallback(() => {
    authLogout();
    setSession(null);
    navigate(ROUTES.LOGIN, { replace: true });
    toast.success('Signed out successfully.');
  }, [setSession, navigate]);

  const syncSession = useCallback(() => {
    const s = getSession();
    setSession(s);
    return !!s;
  }, [setSession]);

  return {
    user: session?.user ?? null,
    session,
    isAuthenticated,
    hasRole,
    login,
    logout,
    syncSession,
  };
}
