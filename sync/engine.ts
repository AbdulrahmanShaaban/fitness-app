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
    for (const remote of remoteRows) {
      const local = await getLocalRow(table.local, remote.id);
      if (!local) {
        await insertLocalRow(table.local, remote);
      } else if (remote.updated_at > (local.updated_at ?? "")) {
        await updateLocalRow(table.local, remote);
      }
    }
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
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      store.setStatus("signed-out");
      return;
    }
    await pullAll();
    await pushChanges();
    store.setStatus("synced");
    store.setLastSyncAt(new Date().toISOString());
  } catch (err) {
    store.setStatus("error");
    store.setLastError(getErrorMessage(err));
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

async function getLocalRow(
  table: string,
  id: string
): Promise<{ updated_at: string } | null> {
  const { expoDb } = await import("../db/client");
  const rows = (await expoDb.getAllAsync(
    `SELECT updated_at FROM ${table} WHERE id = ?`,
    [id]
  )) as { updated_at: string }[];
  return rows[0] ?? null;
}

async function insertLocalRow(table: string, row: RemoteRow): Promise<void> {
  const { expoDb } = await import("../db/client");
  const keys = Object.keys(row);
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  await expoDb.runAsync(
    `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`,
    keys.map((k) => row[k] as SQLiteBindValue)
  );
}

async function updateLocalRow(table: string, row: RemoteRow): Promise<void> {
  const { expoDb } = await import("../db/client");
  const keys = Object.keys(row);
  const assignments = keys.map((k) => `"${k}" = ?`).join(", ");
  await expoDb.runAsync(
    `UPDATE ${table} SET ${assignments} WHERE id = ?`,
    [...keys.map((k) => row[k] as SQLiteBindValue), row.id]
  );
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