import { db } from "./client";
import { exercises } from "./schema";
import { nowIso } from "../lib/utils/date";
import { newId } from "../lib/utils/id";

export interface SeedExercise {
  name: string;
  muscleGroup: string;
}

const SEED_EXERCISES: SeedExercise[] = [
  { name: "Back Squat", muscleGroup: "Legs" },
  { name: "Front Squat", muscleGroup: "Legs" },
  { name: "Deadlift", muscleGroup: "Back" },
  { name: "Romanian Deadlift", muscleGroup: "Back" },
  { name: "Bench Press", muscleGroup: "Chest" },
  { name: "Incline Bench Press", muscleGroup: "Chest" },
  { name: "Overhead Press", muscleGroup: "Shoulders" },
  { name: "Pull-Up", muscleGroup: "Back" },
  { name: "Barbell Row", muscleGroup: "Back" },
  { name: "Lat Pulldown", muscleGroup: "Back" },
  { name: "Dumbbell Curl", muscleGroup: "Arms" },
  { name: "Triceps Pushdown", muscleGroup: "Arms" },
  { name: "Lunge", muscleGroup: "Legs" },
  { name: "Leg Press", muscleGroup: "Legs" },
  { name: "Leg Curl", muscleGroup: "Legs" },
  { name: "Leg Extension", muscleGroup: "Legs" },
  { name: "Hip Thrust", muscleGroup: "Glutes" },
  { name: "Plank", muscleGroup: "Core" },
  { name: "Hanging Leg Raise", muscleGroup: "Core" },
  { name: "Farmer's Carry", muscleGroup: "Full Body" },
];

let seeded = false;

export async function ensureSeed(): Promise<void> {
  if (seeded) return;
  const existing = await db.select().from(exercises).limit(1);
  if (existing.length > 0) {
    seeded = true;
    return;
  }
  const stamp = nowIso();
  await db.insert(exercises).values(
    SEED_EXERCISES.map((e) => ({
      id: newId(),
      name: e.name,
      muscleGroup: e.muscleGroup,
      isCustom: false,
      isDeleted: false,
      createdAt: stamp,
      updatedAt: stamp,
    }))
  );
  seeded = true;
}