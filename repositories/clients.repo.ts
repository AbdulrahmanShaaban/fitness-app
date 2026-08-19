import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "../db/client";
import { clients } from "../db/schema";
import { requestSync } from "../sync/engine";
import { nowIso } from "../lib/utils/date";
import { newId } from "../lib/utils/id";
import type { Client, ClientWithStats, NewClient } from "../types";

const ACTIVE = and(eq(clients.isDeleted, false));

export async function listClients(): Promise<Client[]> {
  return db
    .select()
    .from(clients)
    .where(ACTIVE)
    .orderBy(desc(clients.createdAt));
}

export async function searchClients(query: string): Promise<Client[]> {
  const q = `%${query.trim()}%`;
  return db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.isDeleted, false),
        sql`lower(${clients.fullName}) LIKE lower(${q})`
      )
    )
    .orderBy(desc(clients.createdAt));
}

export async function getClient(id: string): Promise<Client | null> {
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.isDeleted, false)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createClient(
  input: Omit<NewClient, "id" | "createdAt" | "updatedAt" | "isDeleted">
): Promise<Client> {
  const stamp = nowIso();
  const row: NewClient = {
    ...input,
    id: newId(),
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(clients).values(row);
  requestSync();
  return row as Client;
}

export async function updateClient(
  id: string,
  patch: Partial<Omit<NewClient, "id" | "createdAt" | "isDeleted">>
): Promise<Client> {
  const updatedAt = nowIso();
  await db
    .update(clients)
    .set({ ...patch, updatedAt, syncedAt: null })
    .where(eq(clients.id, id));
  requestSync();
  const updated = await getClient(id);
  if (!updated) throw new Error(`Client ${id} not found after update`);
  return updated;
}

export async function softDeleteClient(id: string): Promise<void> {
  await db
    .update(clients)
    .set({ isDeleted: true, updatedAt: nowIso(), syncedAt: null })
    .where(eq(clients.id, id));
  requestSync();
}

export async function countClients(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(ACTIVE);
  return Number(rows[0]?.count ?? 0);
}

export async function listClientsWithStats(): Promise<ClientWithStats[]> {
  const rows = await db
    .select({
      client: clients,
      lastSessionDate: sql<string | null>`(
        select max(s.date) from sessions s
        where s.client_id = ${clients.id} and s.is_deleted = 0
      )`,
      lastAssessmentDate: sql<string | null>`(
        select max(a.date) from assessments a
        where a.client_id = ${clients.id} and a.is_deleted = 0
      )`,
      sessionCount: sql<number>`(
        select count(*) from sessions s
        where s.client_id = ${clients.id} and s.is_deleted = 0
      )`,
    })
    .from(clients)
    .where(ACTIVE)
    .orderBy(asc(clients.fullName));

  return rows.map((r) => ({
    ...r.client,
    lastSessionDate: r.lastSessionDate ?? undefined,
    lastAssessmentDate: r.lastAssessmentDate ?? undefined,
    sessionCount: Number(r.sessionCount ?? 0),
  }));
}

export async function listRecentClients(limit: number): Promise<Client[]> {
  return db
    .select()
    .from(clients)
    .where(ACTIVE)
    .orderBy(desc(clients.updatedAt))
    .limit(limit);
}

export async function listRecentlyActiveClients(limit: number): Promise<Client[]> {
  return db
    .select()
    .from(clients)
    .where(ACTIVE)
    .orderBy(
      sql`coalesce((select max(s.date) from sessions s where s.client_id = ${clients.id} and s.is_deleted = 0), '') desc`
    )
    .limit(limit);
}