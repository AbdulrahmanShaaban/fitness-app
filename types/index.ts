import type { assessmentTests, clientPhotos, clients, sessions, sets, exercises, sessionExercises, assessments } from "../db/schema";

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type SessionExercise = typeof sessionExercises.$inferSelect;
export type NewSessionExercise = typeof sessionExercises.$inferInsert;

export type SetRecord = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;

export type AssessmentTest = typeof assessmentTests.$inferSelect;
export type NewAssessmentTest = typeof assessmentTests.$inferInsert;

export type ClientPhoto = typeof clientPhotos.$inferSelect;
export type NewClientPhoto = typeof clientPhotos.$inferInsert;

export interface SessionExerciseWithSets {
  sessionExercise: SessionExercise;
  exercise: Exercise;
  sets: SetRecord[];
}

export interface SessionDetail {
  session: Session;
  exercises: SessionExerciseWithSets[];
}

export interface AssessmentDetail {
  assessment: Assessment;
  tests: AssessmentTest[];
  photos: ClientPhoto[];
}

export interface ClientWithStats extends Client {
  lastSessionDate?: string;
  lastAssessmentDate?: string;
  sessionCount: number;
}

export interface PreviousPerformance {
  session: Session;
  sets: SetRecord[];
}

export type AssessmentType =
  | "body"
  | "movement"
  | "cardio"
  | "strength"
  | "mobility"
  | "balance"
  | "custom";

export type PhotoAngle = "front" | "side" | "back";