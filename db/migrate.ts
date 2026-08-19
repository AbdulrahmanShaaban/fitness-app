import { Asset } from "expo-asset";
import { File } from "expo-file-system";

import { expoDb } from "./client";
import m0000 from "../drizzle/0000_tricky_lady_deathstrike.sql";

interface Migration {
  name: string;
  asset: Asset;
}

const migrations: Migration[] = [
  { name: "0000_tricky_lady_deathstrike", asset: Asset.fromModule(m0000) },
];

let migrated = false;

export async function ensureMigrations(): Promise<void> {
  if (migrated) return;
  await expoDb.execAsync(
    "CREATE TABLE IF NOT EXISTS __migrations (id TEXT PRIMARY KEY, created_at TEXT NOT NULL)"
  );
  const appliedRows = await expoDb.getAllAsync<{ id: string }>(
    "SELECT id FROM __migrations"
  );
  const applied = new Set(appliedRows.map((r) => r.id));

  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    await migration.asset.downloadAsync();
    const file = new File(migration.asset.localUri ?? migration.asset.uri);
    const sql = await file.text();
    await expoDb.execAsync(sql);
    await expoDb.runAsync("INSERT INTO __migrations (id, created_at) VALUES (?, ?)", [
      migration.name,
      new Date().toISOString(),
    ]);
  }
  migrated = true;
}

export function resetMigrationGuardForTests(): void {
  migrated = false;
}

export { expoDb };