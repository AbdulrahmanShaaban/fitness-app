import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  copyPreviousSession,
  createSession,
  findPreviousPerformance,
  getSessionDetail,
  listRecentSessionsWithClient,
  listSessionsByClient,
  softDeleteSession,
  updateSession,
} from "../../repositories/sessions.repo";
import {
  addExerciseToSession,
  removeExerciseFromSession,
} from "../../repositories/sessionExercises.repo";
import { addSet, deleteSet, updateSet } from "../../repositories/sets.repo";
import type { NewSession, PreviousPerformance } from "../../types";

const KEY = "sessions";

export function useSessions(clientId: string | undefined) {
  return useQuery({
    queryKey: [KEY, "byClient", clientId],
    queryFn: () => listSessionsByClient(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useRecentSessions(limit: number) {
  return useQuery({
    queryKey: [KEY, "recent", limit],
    queryFn: () => listRecentSessionsWithClient(limit),
  });
}

export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: [KEY, "detail", sessionId],
    queryFn: () => getSessionDetail(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Omit<NewSession, "id" | "createdAt" | "updatedAt" | "isDeleted" | "date"> & {
        date?: string;
      }
    ) => createSession(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateSession>[1] }) =>
      updateSession(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCopyPreviousSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, templateName }: { clientId: string; templateName?: string }) =>
      copyPreviousSession(clientId, templateName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useAddExerciseToSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, exerciseId }: { sessionId: string; exerciseId: string }) =>
      addExerciseToSession(sessionId, exerciseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "detail"] }),
  });
}

export function useRemoveExerciseFromSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionExerciseId: string) => removeExerciseFromSession(sessionExerciseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "detail"] }),
  });
}

export function useAddSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionExerciseId,
      input,
    }: {
      sessionExerciseId: string;
      input: { weight: number; reps: number; intensity?: string; notes?: string };
    }) => addSet(sessionExerciseId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "detail"] }),
  });
}

export function useUpdateSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Parameters<typeof updateSet>[1];
    }) => updateSet(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "detail"] }),
  });
}

export function useDeleteSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "detail"] }),
  });
}

export function usePreviousPerformance(
  clientId: string | undefined,
  exerciseId: string | undefined,
  excludeSessionId?: string
) {
  return useQuery({
    queryKey: [KEY, "prevPerf", clientId, exerciseId, excludeSessionId],
    queryFn: () =>
      findPreviousPerformance(clientId as string, exerciseId as string, excludeSessionId),
    enabled: Boolean(clientId && exerciseId),
  });
}

export type { PreviousPerformance };