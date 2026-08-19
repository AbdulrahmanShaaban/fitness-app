import { describe, expect, it, vi } from "vitest";

vi.mock("expo-crypto", () => ({
  randomUUID: () => "00000000-0000-4000-8000-000000000001",
}));

import { buildCopyPayload } from "../lib/utils/copySession";
import type { SessionDetail } from "../types";

function makeSessionDetail(): SessionDetail {
  const stamp = "2026-08-19T08:00:00.000Z";
  return {
    session: {
      id: "session-old",
      clientId: "client-1",
      date: "2026-08-18",
      notes: null,
      templateName: "Upper A",
      isDeleted: false,
      createdAt: stamp,
      updatedAt: stamp,
      syncedAt: null,
    },
    exercises: [
      {
        sessionExercise: {
          id: "se-1",
          sessionId: "session-old",
          exerciseId: "ex-1",
          orderIndex: 0,
          isDeleted: false,
          createdAt: stamp,
          updatedAt: stamp,
          syncedAt: null,
        },
        exercise: {
          id: "ex-1",
          name: "Bench Press",
          muscleGroup: "Chest",
          notes: null,
          videoLink: null,
          isCustom: false,
          isDeleted: false,
          createdAt: stamp,
          updatedAt: stamp,
          syncedAt: null,
        },
        sets: [
          {
            id: "set-1",
            sessionExerciseId: "se-1",
            setNumber: 1,
            weight: 60,
            reps: 8,
            intensity: "RIR 2",
            notes: null,
            isDeleted: false,
            createdAt: stamp,
            updatedAt: stamp,
            syncedAt: null,
          },
          {
            id: "set-2",
            sessionExerciseId: "se-1",
            setNumber: 2,
            weight: 62.5,
            reps: 6,
            intensity: "RIR 1",
            notes: "felt heavy",
            isDeleted: false,
            createdAt: stamp,
            updatedAt: stamp,
            syncedAt: null,
          },
        ],
      },
    ],
  };
}

describe("buildCopyPayload", () => {
  it("deep-copies exercises and sets into a new session", () => {
    const payload = buildCopyPayload(makeSessionDetail(), "session-new");

    expect(payload.sessionExercises).toHaveLength(1);
    expect(payload.sessionExercises[0].sessionId).toBe("session-new");
    expect(payload.sessionExercises[0].exerciseId).toBe("ex-1");
    expect(payload.sessionExercises[0].orderIndex).toBe(0);
    expect(payload.sessionExercises[0].id).not.toBe("se-1");

    expect(payload.sets).toHaveLength(2);
    expect(payload.sets[0]).toMatchObject({
      setNumber: 1,
      weight: 60,
      reps: 8,
      intensity: "RIR 2",
    });
    expect(payload.sets[1].notes).toBe("felt heavy");
    expect(payload.sets[0].id).not.toBe("set-1");
    expect(payload.sets[0].sessionExerciseId).toBe(payload.sessionExercises[0].id);
  });

  it("skips soft-deleted sets", () => {
    const detail = makeSessionDetail();
    detail.exercises[0].sets[1].isDeleted = true;
    const payload = buildCopyPayload(detail, "session-new");
    expect(payload.sets).toHaveLength(1);
    expect(payload.sets[0].setNumber).toBe(1);
  });

  it("produces empty payloads for an empty session", () => {
    const detail = makeSessionDetail();
    detail.exercises = [];
    const payload = buildCopyPayload(detail, "session-new");
    expect(payload.sessionExercises).toHaveLength(0);
    expect(payload.sets).toHaveLength(0);
  });
});