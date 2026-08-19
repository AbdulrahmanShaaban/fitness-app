import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "../db/client";
import { assessmentTests, assessments } from "../db/schema";
import { requestSync } from "../sync/engine";
import { nowIso, todayIso } from "../lib/utils/date";
import { newId } from "../lib/utils/id";
import { listPhotosForAssessment } from "./photos.repo";
import type {
  Assessment,
  AssessmentDetail,
  AssessmentTest,
  AssessmentType,
  NewAssessment,
  NewAssessmentTest,
} from "../types";

export async function listAssessmentsByClient(clientId: string): Promise<Assessment[]> {
  return db
    .select()
    .from(assessments)
    .where(and(eq(assessments.clientId, clientId), eq(assessments.isDeleted, false)))
    .orderBy(desc(assessments.date), desc(assessments.createdAt));
}

export async function getAssessment(id: string): Promise<Assessment | null> {
  const rows = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, id), eq(assessments.isDeleted, false)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createAssessment(
  input: Omit<NewAssessment, "id" | "createdAt" | "updatedAt" | "isDeleted">
): Promise<Assessment> {
  const stamp = nowIso();
  const row: NewAssessment = {
    ...input,
    date: input.date ?? todayIso(),
    id: newId(),
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(assessments).values(row);
  requestSync();
  return row as Assessment;
}

export async function softDeleteAssessment(id: string): Promise<void> {
  await db
    .update(assessments)
    .set({ isDeleted: true, updatedAt: nowIso(), syncedAt: null })
    .where(eq(assessments.id, id));
  requestSync();
}

export async function getAssessmentDetail(id: string): Promise<AssessmentDetail | null> {
  const assessment = await getAssessment(id);
  if (!assessment) return null;

  const testRows = await db
    .select()
    .from(assessmentTests)
    .where(
      and(
        eq(assessmentTests.assessmentId, id),
        eq(assessmentTests.isDeleted, false)
      )
    )
    .orderBy(asc(assessmentTests.createdAt));

  const photos = await listPhotosForAssessment(id);
  return { assessment, tests: testRows as AssessmentTest[], photos };
}

export async function addTest(
  assessmentId: string,
  input: { testName: string; fields: Record<string, unknown>; result?: string; notes?: string }
): Promise<AssessmentTest> {
  const stamp = nowIso();
  const row: NewAssessmentTest = {
    id: newId(),
    assessmentId,
    testName: input.testName,
    fields: input.fields,
    result: input.result,
    notes: input.notes,
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(assessmentTests).values(row);
  requestSync();
  return row as AssessmentTest;
}

export async function updateTest(
  id: string,
  patch: Partial<Omit<NewAssessmentTest, "id" | "assessmentId" | "createdAt" | "isDeleted">>
): Promise<void> {
  await db
    .update(assessmentTests)
    .set({ ...patch, updatedAt: nowIso(), syncedAt: null })
    .where(eq(assessmentTests.id, id));
  requestSync();
}

export async function deleteTest(id: string): Promise<void> {
  await db
    .update(assessmentTests)
    .set({ isDeleted: true, updatedAt: nowIso(), syncedAt: null })
    .where(eq(assessmentTests.id, id));
  requestSync();
}

export function isAssessmentType(value: string): value is AssessmentType {
  return [
    "body",
    "movement",
    "cardio",
    "strength",
    "mobility",
    "balance",
    "custom",
  ].includes(value);
}

export async function countAssessments(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(assessments)
    .where(eq(assessments.isDeleted, false));
  return Number(rows[0]?.count ?? 0);
}

export async function listAllTestsWithAssessments(clientId: string) {
  const rows = await db
    .select({
      test: assessmentTests,
      assessment: assessments,
    })
    .from(assessmentTests)
    .innerJoin(assessments, eq(assessments.id, assessmentTests.assessmentId))
    .where(
      and(
        eq(assessmentTests.isDeleted, false),
        eq(assessments.isDeleted, false),
        eq(assessments.clientId, clientId)
      )
    )
    .orderBy(asc(assessmentTests.createdAt));

  return rows.map((r) => ({ test: r.test as AssessmentTest, assessment: r.assessment }));
}