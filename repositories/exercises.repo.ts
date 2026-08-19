import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { db } from "../db/client";
import { exercises } from "../db/schema";
import { requestSync } from "../sync/engine";
import { nowIso } from "../lib/utils/date";
import { newId } from "../lib/utils/id";
import type { Exercise, NewExercise } from "../types";

export async function listExercises(): Promise<Exercise[]> {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.isDeleted, false))
    .orderBy(asc(exercises.name));
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const q = `%${query.trim()}%`;
  return db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.isDeleted, false),
        sql`lower(${exercises.name}) LIKE lower(${q})`
      )
    )
    .orderBy(asc(exercises.name));
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const rows = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, id), eq(exercises.isDeleted, false)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createExercise(
  input: Omit<NewExercise, "id" | "createdAt" | "updatedAt" | "isDeleted" | "isCustom">
): Promise<Exercise> {
  const stamp = nowIso();
  const row: NewExercise = {
    ...input,
    id: newId(),
    isCustom: true,
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(exercises).values(row);
  requestSync();
  return row as Exercise;
}