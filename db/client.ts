import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "./schema";

export const expoDb = openDatabaseSync("trainer-notebook.db");

export const db = drizzle(expoDb, { schema });