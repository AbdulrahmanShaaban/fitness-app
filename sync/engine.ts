import type { SQLiteBindValue } from "expo-sqlite";

import { getErrorMessage } from "../lib/utils/errors";
import { useSyncStore } from "../lib/store/syncStore";
import { getSupabase, isSyncConfigured } from "./client";

export interface SyncableTable {
  local: string;
  remote: string;
}

export const SYNC_TABLES: SyncableTable[] = [
  { local: "clients", remote: "clients" },
  { local: "sessions", remote: "sessions" },
  { local: "session_exercises", remote: "session_exercises" },
  { local: "sets", remote: "sets" },
  { local: "exercises", remote: "exercises" },
  { local: "assessments", remote: "assessments" },
  { local: "assessment_tests", remote: "assessment_tests" },
];

export async function getSyncUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function isSignedIn(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

interface RemoteRow extends Record<string, unknown> {
  id: string;
  updated_at: string;
  is_deleted?: boolean;
}

async function fetchAllRows(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  table: SyncableTable
): Promise<RemoteRow[]> {
  const { data, error } = await supabase
    .from(table.remote)
    .select("*")
    .order("updated_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RemoteRow[];
}

export async function pushChanges(): Promise<void> {
  const store = useSyncStore.getState();
  const supabase = getSupabase();
  if (!supabase || !isSyncConfigured()) {
    store.setStatus("disabled");
    return;
  }
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    store.setStatus("signed-out");
    return;
  }
  const userId = session.session.user.id;

  for (const table of SYNC_TABLES) {
    const dirty = await getDirtyRows(table.local);
    if (dirty.length === 0) continue;
    const payload = dirty.map((row) => ({ ...row, user_id: userId }));
    const { error } = await supabase.from(table.remote).upsert(payload, {
      onConflict: "id",
    });
    if (error) throw error;
    await markSynced(table.local, dirty.map((r) => r.id as string));
  }
}

export async function pullAll(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !isSyncConfigured()) return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;

  for (const table of SYNC_TABLES) {
    const remoteRows = await fetchAllRows(supabase, table);
    if (remoteRows.length === 0) continue;
    const existing = await getLocalRows(table.local, remoteRows.map((r) => r.id));
    const toInsert = remoteRows.filter((r) => !existing.has(r.id));
    const toUpdate = remoteRows.filter((r) => {
      const local = existing.get(r.id);
      return local ? (r.updated_at ?? "") > local.updated_at : false;
    });
    if (toInsert.length > 0) await insertLocalRows(table.local, toInsert);
    if (toUpdate.length > 0) await updateLocalRows(table.local, toUpdate);
  }
}

export async function runSync(): Promise<void> {
  const store = useSyncStore.getState();
  if (!isSyncConfigured()) {
    store.setStatus("disabled");
    return;
  }
  store.setStatus("syncing");
  store.setLastError(null);
  const startedAt = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      store.setStatus("signed-out");
      return;
    }
    const pullStart = Date.now();
    await pullAll();
    console.log(`[sync] pull done in ${Date.now() - pullStart}ms`);
    const pushStart = Date.now();
    await pushChanges();
    console.log(`[sync] push done in ${Date.now() - pushStart}ms`);
    const { expoDb } = await import("../db/client");
    await expoDb.execAsync("PRAGMA wal_checkpoint(PASSIVE)");
    store.setStatus("synced");
    store.setLastSyncAt(new Date().toISOString());
    console.log(`[sync] total ${Date.now() - startedAt}ms`);
  } catch (err) {
    store.setStatus("error");
    store.setLastError(getErrorMessage(err));
    console.log(`[sync] error after ${Date.now() - startedAt}ms:`, getErrorMessage(err));
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function requestSync(): void {
  if (!isSyncConfigured()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void runSync();
  }, 4000);
}

async function getDirtyRows(table: string): Promise<Record<string, unknown>[]> {
  const { expoDb } = await import("../db/client");
  return expoDb.getAllAsync(
    `SELECT * FROM ${table} WHERE synced_at IS NULL OR updated_at > synced_at`
  ) as Promise<Record<string, unknown>[]>;
}

async function getLocalRows(
  table: string,
  ids: string[]
): Promise<Map<string, { updated_at: string }>> {
  const { expoDb } = await import("../db/client");
  if (ids.length === 0) return new Map();
  const placeholders = ids.map(() => "?").join(", ");
  const rows = (await expoDb.getAllAsync(
    `SELECT id, updated_at FROM ${table} WHERE id IN (${placeholders})`,
    ids
  )) as { id: string; updated_at: string }[];
  return new Map(rows.map((r) => [r.id, { updated_at: r.updated_at ?? "" }]));
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function insertLocalRows(table: string, rows: RemoteRow[]): Promise<void> {
  const { expoDb } = await import("../db/client");
  const keys = Object.keys(rows[0]).filter((k) => k !== "user_id");
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const values = rows
    .map((row) => `(${keys.map((k) => sqlLiteral(row[k])).join(", ")})`)
    .join(", ");
  await expoDb.execAsync(`INSERT OR REPLACE INTO ${table} (${cols}) VALUES ${values}`);
}

async function updateLocalRows(table: string, rows: RemoteRow[]): Promise<void> {
  const { expoDb } = await import("../db/client");
  const keys = Object.keys(rows[0]).filter((k) => k !== "user_id");
  const statements = rows.map(
    (row) =>
      `UPDATE ${table} SET ${keys
        .map((k) => `"${k}" = ${sqlLiteral(row[k])}`)
        .join(", ")} WHERE id = ${sqlLiteral(row.id)}`
  );
  await expoDb.execAsync(statements.join("; "));
}

async function markSynced(table: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { expoDb } = await import("../db/client");
  const placeholders = ids.map(() => "?").join(", ");
  await expoDb.runAsync(
    `UPDATE ${table} SET synced_at = ? WHERE id IN (${placeholders})`,
    [new Date().toISOString(), ...ids]
  );
}