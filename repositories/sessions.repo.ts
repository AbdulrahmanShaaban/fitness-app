import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "../db/client";
import { clients, exercises, sessionExercises, sessions, sets } from "../db/schema";
import { requestSync } from "../sync/engine";
import { nowIso, todayIso } from "../lib/utils/date";
import { newId } from "../lib/utils/id";
import { buildCopyPayload } from "../lib/utils/copySession";
import { listSetsForSessionExercise } from "./sets.repo";
import type {
  NewSession,
  PreviousPerformance,
  Session,
  SessionDetail,
  SessionExercise,
  SessionExerciseWithSets,
  SetRecord,
} from "../types";

export async function listSessionsByClient(clientId: string): Promise<Session[]> {
  return db
    .select()
    .from(sessions)
    .where(and(eq(sessions.clientId, clientId), eq(sessions.isDeleted, false)))
    .orderBy(desc(sessions.date), desc(sessions.createdAt));
}

export async function getSession(id: string): Promise<Session | null> {
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.isDeleted, false)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const exerciseRows = await db
    .select({
      sessionExercise: sessionExercises,
      exercise: exercises,
    })
    .from(sessionExercises)
    .innerJoin(exercises, eq(exercises.id, sessionExercises.exerciseId))
    .where(
      and(
        eq(sessionExercises.sessionId, sessionId),
        eq(sessionExercises.isDeleted, false)
      )
    )
    .orderBy(asc(sessionExercises.orderIndex));

  const withSets: SessionExerciseWithSets[] = [];
  for (const row of exerciseRows) {
    const setRows = await listSetsForSessionExercise(row.sessionExercise.id);
    withSets.push({
      sessionExercise: row.sessionExercise,
      exercise: row.exercise,
      sets: setRows,
    });
  }
  return { session, exercises: withSets };
}

export async function createSession(
  input: Omit<NewSession, "id" | "createdAt" | "updatedAt" | "isDeleted" | "date"> & {
    date?: string;
  }
): Promise<Session> {
  const stamp = nowIso();
  const row: NewSession = {
    ...input,
    date: input.date ?? todayIso(),
    id: newId(),
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(sessions).values(row);
  requestSync();
  return row as Session;
}

export async function updateSession(
  id: string,
  patch: Partial<Omit<NewSession, "id" | "clientId" | "createdAt" | "isDeleted">>
): Promise<Session> {
  const updatedAt = nowIso();
  await db
    .update(sessions)
    .set({ ...patch, updatedAt, syncedAt: null })
    .where(eq(sessions.id, id));
  requestSync();
  const updated = await getSession(id);
  if (!updated) throw new Error(`Session ${id} not found after update`);
  return updated;
}

export async function softDeleteSession(id: string): Promise<void> {
  await db
    .update(sessions)
    .set({ isDeleted: true, updatedAt: nowIso(), syncedAt: null })
    .where(eq(sessions.id, id));
  requestSync();
}

export async function listRecentSessions(limit: number): Promise<Session[]> {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.isDeleted, false))
    .orderBy(desc(sessions.date), desc(sessions.createdAt))
    .limit(limit);
}

export async function listRecentSessionsWithClient(
  limit: number
): Promise<Array<Session & { clientName: string }>> {
  const rows = await db
    .select({
      session: sessions,
      clientName: clients.fullName,
    })
    .from(sessions)
    .innerJoin(clients, eq(clients.id, sessions.clientId))
    .where(
      and(eq(sessions.isDeleted, false), eq(clients.isDeleted, false))
    )
    .orderBy(desc(sessions.date), desc(sessions.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r.session, clientName: r.clientName }));
}

export async function findPreviousPerformance(
  clientId: string,
  exerciseId: string,
  excludeSessionId?: string
): Promise<PreviousPerformance | null> {
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.clientId, clientId), eq(sessions.isDeleted, false)))
    .orderBy(desc(sessions.date), desc(sessions.createdAt));

  for (const session of sessionRows) {
    if (session.id === excludeSessionId) continue;
    const hasExercise = await db
      .select({ id: sessionExercises.id })
      .from(sessionExercises)
      .where(
        and(
          eq(sessionExercises.sessionId, session.id),
          eq(sessionExercises.exerciseId, exerciseId),
          eq(sessionExercises.isDeleted, false)
        )
      )
      .limit(1);
    if (hasExercise.length === 0) continue;

    const setRows = await db
      .select()
      .from(sets)
      .where(
        and(
          eq(sets.sessionExerciseId, hasExercise[0].id),
          eq(sets.isDeleted, false)
        )
      )
      .orderBy(asc(sets.setNumber));

    return { session, sets: setRows as SetRecord[] };
  }
  return null;
}

export async function findLatestSession(
  clientId: string,
  templateName?: string
): Promise<Session | null> {
  const filters = [eq(sessions.clientId, clientId), eq(sessions.isDeleted, false)];
  if (templateName && templateName.trim().length > 0) {
    filters.push(eq(sessions.templateName, templateName.trim()));
  }
  const rows = await db
    .select()
    .from(sessions)
    .where(and(...filters))
    .orderBy(desc(sessions.date), desc(sessions.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function copyPreviousSession(
  clientId: string,
  templateName?: string
): Promise<{ session: Session | null; copied: boolean }> {
  const previous = await findLatestSession(clientId, templateName);
  if (!previous) return { session: null, copied: false };

  const previousDetail = await getSessionDetail(previous.id);
  if (!previousDetail || previousDetail.exercises.length === 0) {
    return { session: null, copied: false };
  }

  const newSession = await createSession({ clientId });
  const payload = buildCopyPayload(previousDetail, newSession.id);
  await db.insert(sessionExercises).values(payload.sessionExercises);
  await db.insert(sets).values(payload.sets);
  requestSync();
  return { session: newSession, copied: true };
}