export function formatWeight(kg: number | null | undefined): string {
  if (kg === null || kg === undefined || Number.isNaN(kg)) return "—";
  const rounded = Math.round(kg * 100) / 100;
  return String(rounded);
}

export function formatReps(reps: number | null | undefined): string {
  if (reps === null || reps === undefined || Number.isNaN(reps)) return "—";
  return String(reps);
}

export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}