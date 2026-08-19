import type { NewSessionExercise, NewSet, SessionDetail } from "../../types";
import { newId } from "./id";
import { nowIso } from "./date";

export interface CopiedSessionPayload {
  sessionExercises: NewSessionExercise[];
  sets: NewSet[];
}

export function buildCopyPayload(
  previous: SessionDetail,
  newSessionId: string
): CopiedSessionPayload {
  const stamp = nowIso();
  const idByPrevious: Record<string, string> = {};

  const sessionExercises: NewSessionExercise[] = previous.exercises.map((ex) => {
    const id = newId();
    idByPrevious[ex.sessionExercise.id] = id;
    return {
      id,
      sessionId: newSessionId,
      exerciseId: ex.sessionExercise.exerciseId,
      orderIndex: ex.sessionExercise.orderIndex,
      isDeleted: false,
      createdAt: stamp,
      updatedAt: stamp,
    };
  });

  const sets: NewSet[] = previous.exercises.flatMap((ex) =>
    ex.sets
      .filter((s) => !s.isDeleted)
      .map((s) => ({
        id: newId(),
        sessionExerciseId: idByPrevious[ex.sessionExercise.id],
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        intensity: s.intensity,
        notes: s.notes,
        isDeleted: false,
        createdAt: stamp,
        updatedAt: stamp,
      }))
  );

  return { sessionExercises, sets };
}