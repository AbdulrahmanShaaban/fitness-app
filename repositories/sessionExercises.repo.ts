import { and, asc, eq } from "drizzle-orm";

import { db } from "../db/client";
import { exercises, sessionExercises } from "../db/schema";
import { requestSync } from "../sync/engine";
import { nowIso } from "../lib/utils/date";
import { newId } from "../lib/utils/id";
import { listSetsForSessionExercise } from "./sets.repo";
import type { SessionExercise, SessionExerciseWithSets } from "../types";

export async function addExerciseToSession(
  sessionId: string,
  exerciseId: string
): Promise<SessionExercise> {
  const stamp = nowIso();
  const last = await db
    .select({ orderIndex: sessionExercises.orderIndex })
    .from(sessionExercises)
    .where(
      and(
        eq(sessionExercises.sessionId, sessionId),
        eq(sessionExercises.isDeleted, false)
      )
    )
    .orderBy(asc(sessionExercises.orderIndex))
    .limit(1);

  const row = {
    id: newId(),
    sessionId,
    exerciseId,
    orderIndex: (last[0]?.orderIndex ?? -1) + 1,
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
    syncedAt: null,
  };
  await db.insert(sessionExercises).values(row);
  requestSync();
  return row;
}

export async function removeExerciseFromSession(
  sessionExerciseId: string
): Promise<void> {
  await db
    .update(sessionExercises)
    .set({ isDeleted: true, updatedAt: nowIso(), syncedAt: null })
    .where(eq(sessionExercises.id, sessionExerciseId));
  requestSync();
}

export async function getSessionExerciseWithSets(
  sessionExerciseId: string
): Promise<SessionExerciseWithSets | null> {
  const rows = await db
    .select({
      sessionExercise: sessionExercises,
      exercise: exercises,
    })
    .from(sessionExercises)
    .innerJoin(exercises, eq(exercises.id, sessionExercises.exerciseId))
    .where(
      and(
        eq(sessionExercises.id, sessionExerciseId),
        eq(sessionExercises.isDeleted, false)
      )
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return {
    sessionExercise: row.sessionExercise,
    exercise: row.exercise,
    sets: await listSetsForSessionExercise(sessionExerciseId),
  };
}