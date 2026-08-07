import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { getSession } from '@/services/auth.service';
import { ROUTES } from '@/constants';

export default function ProtectedRoute() {
  const { isAuthenticated, setSession } = useAuthStore();

  // Only fall back to auth service on a cold reload where Zustand hasn't hydrated yet
  if (!isAuthenticated) {
    const session = getSession(); // reads cybersynap_auth (auth service key only)
    if (session && session.user && session.expiresAt > Date.now()) {
      setSession(session);
      return <Outlet />;
    }
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
