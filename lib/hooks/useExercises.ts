import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listExercises, searchExercises, createExercise } from "../../repositories/exercises.repo";
import type { NewExercise } from "../../types";

const KEY = "exercises";

export function useExercises(search: string) {
  return useQuery({
    queryKey: [KEY, search],
    queryFn: () =>
      search.trim().length === 0 ? listExercises() : searchExercises(search),
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<NewExercise, "id" | "createdAt" | "updatedAt" | "isDeleted" | "isCustom">) =>
      createExercise(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}