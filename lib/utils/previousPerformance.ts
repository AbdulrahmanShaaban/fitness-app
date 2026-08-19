import type { PreviousPerformance, SessionDetail } from "../../types";

export interface SessionForPicking {
  id: string;
  date: string;
  createdAt: string;
  isDeleted?: boolean;
}

export function pickPreviousSession(
  sessions: SessionForPicking[],
  excludeSessionId?: string
): SessionForPicking | null {
  const eligible = sessions
    .filter((s) => !s.isDeleted && s.id !== excludeSessionId)
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
    });
  return eligible[0] ?? null;
}

export function pickPreviousSessionForExercise(
  sessions: SessionForPicking[],
  exerciseId: string,
  excludeSessionId?: string
): SessionForPicking | null {
  const eligible = sessions
    .filter((s) => !s.isDeleted && s.id !== excludeSessionId)
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
    });
  return eligible[0] ?? null;
}

export function getPreviousPerformance(
  sessionDetails: SessionDetail[],
  exerciseId: string,
  excludeSessionId?: string
): PreviousPerformance | null {
  const sorted = [...sessionDetails]
    .filter(
      (d) => !d.session.isDeleted && d.session.id !== excludeSessionId
    )
    .sort((a, b) => {
      const byDate = b.session.date.localeCompare(a.session.date);
      return byDate !== 0 ? byDate : b.session.createdAt.localeCompare(a.session.createdAt);
    });

  for (const detail of sorted) {
    const match = detail.exercises.find(
      (ex) => ex.exercise.id === exerciseId && !ex.sessionExercise.isDeleted
    );
    if (match) {
      return {
        session: detail.session,
        sets: match.sets.filter((s) => !s.isDeleted),
      };
    }
  }
  return null;
}