import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "./schema";

export const expoDb = openDatabaseSync("trainer-notebook.db");

expoDb.execSync("PRAGMA journal_mode = WAL");
expoDb.execSync("PRAGMA synchronous = NORMAL");
expoDb.execSync("PRAGMA wal_autocheckpoint = 100");
expoDb.execSync("PRAGMA busy_timeout = 8000");

export const db = drizzle(expoDb, { schema });