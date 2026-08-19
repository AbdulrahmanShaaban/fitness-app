import { File, Directory, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { expoDb } from "../../db/client";
import { buildExportBundle, type ExportBundle } from "./exportBundle";

type BundleTable = keyof Omit<ExportBundle, "exportedAt" | "version">;

const TABLES: BundleTable[] = [
  "clients",
  "sessions",
  "sessionExercises",
  "sets",
  "exercises",
  "assessments",
  "assessmentTests",
  "clientPhotos",
];

const SQL_TABLE: Record<BundleTable, string> = {
  clients: "clients",
  sessions: "sessions",
  sessionExercises: "session_exercises",
  sets: "sets",
  exercises: "exercises",
  assessments: "assessments",
  assessmentTests: "assessment_tests",
  clientPhotos: "client_photos",
};

export async function exportAllRows(): Promise<string> {
  const rows = await readAllRows();
  const bundle = buildExportBundle(rows);
  const json = JSON.stringify(bundle, null, 2);

  const exportDir = new Directory(Paths.document, "exports");
  exportDir.create({ intermediates: true, idempotent: true });
  const file = new File(exportDir, `trainer-notebook-export-${Date.now()}.json`);
  file.write(json);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Export Trainer Notebook data",
    });
  }

  return file.uri;
}

export async function exportRowCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const table of TABLES) {
    const result = (await expoDb.getFirstAsync<{ c: number }>(
      `SELECT count(*) AS c FROM ${SQL_TABLE[table]}`
    )) ?? { c: 0 };
    counts[table] = result.c;
  }
  return counts;
}

async function readAllRows(): Promise<Omit<ExportBundle, "exportedAt" | "version">> {
  const bundle: Partial<Record<BundleTable, unknown[]>> = {};
  for (const table of TABLES) {
    bundle[table] = (await expoDb.getAllAsync(
      `SELECT * FROM ${SQL_TABLE[table]}`
    )) as unknown[];
  }
  return bundle as Omit<ExportBundle, "exportedAt" | "version">;
}