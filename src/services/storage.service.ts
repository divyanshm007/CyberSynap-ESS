/* Generic LocalStorage CRUD service — all data lives under "cybersynap_db" */

const DB_KEY = 'cybersynap_db';

export interface DB {
  users: Record<string, unknown>;
  attendance: Record<string, unknown>;
  leaves: Record<string, unknown>;
  leaveBalances: Record<string, unknown>;
  timesheets: Record<string, unknown>;
  tickets: Record<string, unknown>;
  payslips: Record<string, unknown>;
  documents: Record<string, unknown>;
  holidays: Record<string, unknown>;
  announcements: Record<string, unknown>;
  notifications: Record<string, unknown>;
  departments: Record<string, unknown>;
  portal_sessions: Record<string, unknown>;
}

function readDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? migrateDB(JSON.parse(raw)) : emptyDB();
  } catch {
    return emptyDB();
  }
}

function writeDB(db: DB): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function emptyDB(): DB {
  return {
    users: {}, attendance: {}, leaves: {}, leaveBalances: {},
    timesheets: {}, tickets: {}, payslips: {}, documents: {},
    holidays: {}, announcements: {}, notifications: {}, departments: {},
    portal_sessions: {},
  };
}

/** Ensures any collection added after the initial seed exists in the stored DB */
function migrateDB(db: DB): DB {
  if (!db.portal_sessions) db.portal_sessions = {};
  return db;
}

/* ── collection helpers ── */

type Collection = keyof DB;

export function getAll<T>(collection: Collection): T[] {
  const db = readDB();
  return Object.values(db[collection]) as T[];
}

export function getById<T>(collection: Collection, id: string): T | undefined {
  const db = readDB();
  return db[collection][id] as T | undefined;
}

export function insert<T extends { id: string }>(collection: Collection, record: T): T {
  const db = readDB();
  db[collection][record.id] = record;
  writeDB(db);
  return record;
}

export function update<T extends { id: string; updatedAt?: string }>(
  collection: Collection,
  id: string,
  patch: Partial<T>,
): T {
  const db = readDB();
  const existing = db[collection][id];
  if (!existing) throw new Error(`Record ${id} not found in ${collection}`);
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  db[collection][id] = updated;
  writeDB(db);
  return updated as T;
}

export function remove(collection: Collection, id: string): void {
  const db = readDB();
  delete db[collection][id];
  writeDB(db);
}

export function bulkInsert<T extends { id: string }>(collection: Collection, records: T[]): void {
  const db = readDB();
  for (const r of records) db[collection][r.id] = r;
  writeDB(db);
}

export function query<T>(
  collection: Collection,
  predicate: (item: T) => boolean,
): T[] {
  return getAll<T>(collection).filter(predicate);
}

export function clearCollection(collection: Collection): void {
  const db = readDB();
  db[collection] = {};
  writeDB(db);
}

export function isSeeded(): boolean {
  const db = readDB();
  return Object.keys(db.users).length > 0;
}
