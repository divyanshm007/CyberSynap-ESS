import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession } from '@/services/auth.service';
import type { Role } from '@/types';

interface AuthStore {
  session: AuthSession | null;
  setSession: (s: AuthSession | null) => void;
  isAuthenticated: boolean;
  hasRole: (role: Role | Role[]) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,

      setSession: (session) =>
        set({ session, isAuthenticated: !!session }),

      hasRole: (role) => {
        const userRole = get().session?.user?.role;
        if (!userRole) return false;
        return Array.isArray(role) ? role.includes(userRole) : userRole === role;
      },
    }),
    {
      name: 'cybersynap_auth_state',
      partialize: (state) => ({ session: state.session, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
