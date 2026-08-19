import type {
  Assessment,
  AssessmentTest,
  Client,
  ClientPhoto,
  Exercise,
  Session,
  SessionExercise,
  SetRecord,
} from "../../types";

export interface ExportBundle {
  exportedAt: string;
  version: 1;
  clients: Client[];
  sessions: Session[];
  sessionExercises: SessionExercise[];
  sets: SetRecord[];
  exercises: Exercise[];
  assessments: Assessment[];
  assessmentTests: AssessmentTest[];
  clientPhotos: ClientPhoto[];
}

export function buildExportBundle(
  rows: Omit<ExportBundle, "exportedAt" | "version">,
  exportedAt = new Date().toISOString()
): ExportBundle {
  return { exportedAt, version: 1, ...rows };
}

export function serializeExportBundle(bundle: ExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function exportFileContents(
  rows: Omit<ExportBundle, "exportedAt" | "version">
): string {
  return serializeExportBundle(buildExportBundle(rows));
}