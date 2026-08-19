import { describe, expect, it } from "vitest";

import { getPreviousPerformance } from "../lib/utils/previousPerformance";
import type { SessionDetail } from "../types";

function detail(
  id: string,
  date: string,
  createdAt: string,
  exerciseIds: string[],
  weights: number[]
): SessionDetail {
  const stamp = createdAt;
  return {
    session: {
      id,
      clientId: "client-1",
      date,
      notes: null,
      templateName: null,
      isDeleted: false,
      createdAt: stamp,
      updatedAt: stamp,
      syncedAt: null,
    },
    exercises: exerciseIds.map((exerciseId, i) => ({
      sessionExercise: {
        id: `se-${id}-${i}`,
        sessionId: id,
        exerciseId,
        orderIndex: i,
        isDeleted: false,
        createdAt: stamp,
        updatedAt: stamp,
        syncedAt: null,
      },
      exercise: {
        id: exerciseId,
        name: exerciseId,
        muscleGroup: null,
        notes: null,
        videoLink: null,
        isCustom: false,
        isDeleted: false,
        createdAt: stamp,
        updatedAt: stamp,
        syncedAt: null,
      },
      sets: weights.map((w, j) => ({
        id: `set-${id}-${i}-${j}`,
        sessionExerciseId: `se-${id}-${i}`,
        setNumber: j + 1,
        weight: w,
        reps: 8,
        intensity: null,
        notes: null,
        isDeleted: false,
        createdAt: stamp,
        updatedAt: stamp,
        syncedAt: null,
      })),
    })),
  };
}

describe("getPreviousPerformance", () => {
  const sessions = [
    detail("s1", "2026-08-01", "2026-08-01T08:00:00Z", ["bench"], [50, 52.5]),
    detail("s2", "2026-08-10", "2026-08-10T08:00:00Z", ["squat"], [80]),
    detail("s3", "2026-08-15", "2026-08-15T08:00:00Z", ["bench", "squat"], [55, 57.5]),
  ];

  it("returns the most recent prior session containing the exercise", () => {
    const perf = getPreviousPerformance(sessions, "bench");
    expect(perf?.session.id).toBe("s3");
    expect(perf?.sets.map((s) => s.weight)).toEqual([55, 57.5]);
  });

  it("excludes the current session id", () => {
    const perf = getPreviousPerformance(sessions, "bench", "s3");
    expect(perf?.session.id).toBe("s1");
    expect(perf?.sets.map((s) => s.weight)).toEqual([50, 52.5]);
  });

  it("returns null when the exercise was never performed", () => {
    const perf = getPreviousPerformance(sessions, "deadlift");
    expect(perf).toBeNull();
  });

  it("ignores deleted sessions", () => {
    const withDeleted = [...sessions];
    withDeleted[2].session.isDeleted = true;
    const perf = getPreviousPerformance(withDeleted, "bench");
    expect(perf?.session.id).toBe("s1");
  });

  it("sorts by date first, then createdAt", () => {
    const sameDate = [
      detail("early", "2026-08-10", "2026-08-10T09:00:00Z", ["bench"], [40]),
      detail("late", "2026-08-10", "2026-08-10T18:00:00Z", ["bench"], [45]),
    ];
    const perf = getPreviousPerformance(sameDate, "bench");
    expect(perf?.session.id).toBe("late");
  });
});