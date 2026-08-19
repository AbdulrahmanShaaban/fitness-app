import { and, asc, eq } from "drizzle-orm";

import { db } from "../db/client";
import { sets } from "../db/schema";
import { requestSync } from "../sync/engine";
import { nowIso } from "../lib/utils/date";
import { newId } from "../lib/utils/id";
import type { NewSet, SetRecord } from "../types";

export async function listSetsForSessionExercise(
  sessionExerciseId: string
): Promise<SetRecord[]> {
  return db
    .select()
    .from(sets)
    .where(
      and(
        eq(sets.sessionExerciseId, sessionExerciseId),
        eq(sets.isDeleted, false)
      )
    )
    .orderBy(asc(sets.setNumber));
}

export async function addSet(
  sessionExerciseId: string,
  input: { weight: number; reps: number; intensity?: string; notes?: string }
): Promise<SetRecord> {
  const stamp = nowIso();
  const last = await db
    .select({ setNumber: sets.setNumber })
    .from(sets)
    .where(
      and(
        eq(sets.sessionExerciseId, sessionExerciseId),
        eq(sets.isDeleted, false)
      )
    )
    .orderBy(asc(sets.setNumber))
    .limit(1);

  const row: NewSet = {
    id: newId(),
    sessionExerciseId,
    setNumber: (last[0]?.setNumber ?? 0) + 1,
    weight: input.weight,
    reps: input.reps,
    intensity: input.intensity,
    notes: input.notes,
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(sets).values(row);
  requestSync();
  return row as SetRecord;
}

export async function updateSet(
  id: string,
  patch: Partial<Omit<NewSet, "id" | "sessionExerciseId" | "createdAt" | "isDeleted">>
): Promise<void> {
  await db
    .update(sets)
    .set({ ...patch, updatedAt: nowIso(), syncedAt: null })
    .where(eq(sets.id, id));
  requestSync();
}

export async function deleteSet(id: string): Promise<void> {
  await db
    .update(sets)
    .set({ isDeleted: true, updatedAt: nowIso(), syncedAt: null })
    .where(eq(sets.id, id));
  requestSync();
}