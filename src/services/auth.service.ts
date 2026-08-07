import { getAll, query, insert, update } from './storage.service';
import type { User, PortalSession } from '@/types';

const AUTH_KEY = 'cybersynap_auth';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export interface AuthSession {
  user: Omit<User, 'password'>;
  token: string;
  expiresAt: number;
}

function fakeToken(userId: string): string {
  return btoa(`cybersynap:${userId}:${Date.now()}`);
}

export function login(email: string, password: string): AuthSession {
  const users = getAll<User>('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) throw new Error('Invalid email or password.');
  if (user.status !== 'active') throw new Error('Your account is inactive. Contact HR.');

  const { password: _pw, ...safeUser } = user;
  const session: AuthSession = {
    user: safeUser,
    token: fakeToken(user.id),
    expiresAt: Date.now() + SESSION_DURATION,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));

  // Record portal login time
  const portalSession: PortalSession = {
    id: `ps_${Date.now()}`,
    userId: user.id,
    loginAt: new Date().toISOString(),
  };
  insert<PortalSession>('portal_sessions', portalSession);

  return session;
}

export function logout(): void {
  // Stamp logout time on the active portal session
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      const sessions = query<PortalSession>('portal_sessions', s => s.userId === session.user.id && !s.logoutAt)
        .sort((a, b) => b.loginAt.localeCompare(a.loginAt));
      if (sessions.length > 0) {
        const active = sessions[0];
        const durationMins = Math.round((Date.now() - new Date(active.loginAt).getTime()) / 60000);
        update<PortalSession>('portal_sessions', active.id, {
          logoutAt: new Date().toISOString(),
          durationMins,
        });
      }
    }
  } catch { /* silent */ }
  localStorage.removeItem(AUTH_KEY);
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      logout();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function refreshSession(session: AuthSession): AuthSession {
  const refreshed = { ...session, expiresAt: Date.now() + SESSION_DURATION };
  localStorage.setItem(AUTH_KEY, JSON.stringify(refreshed));
  return refreshed;
}

export function getUserById(id: string): User | undefined {
  return query<User>('users', u => u.id === id)[0];
}

export function updatePassword(userId: string, current: string, next: string): void {
  const user = getUserById(userId);
  if (!user) throw new Error('User not found.');
  if (user.password !== current) throw new Error('Current password is incorrect.');
  if (next.length < 8) throw new Error('New password must be at least 8 characters.');
  // In a real app: hash. Here we store plain for demo.
  const users = getAll<User>('users');
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].password = next;
    // re-persist via storage service would need update(), but we do it inline for simplicity
    const raw = localStorage.getItem('cybersynap_db');
    if (raw) {
      const db = JSON.parse(raw);
      db.users[userId] = users[idx];
      localStorage.setItem('cybersynap_db', JSON.stringify(db));
    }
  }
}
